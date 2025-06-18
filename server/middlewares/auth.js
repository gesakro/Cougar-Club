// middleware/auth.js
const jwt = require('jsonwebtoken');
const Brand = require('../models/Brand'); // Import Brand model
const Product = require('../models/Product'); // Import Product model

exports.verifyToken = (req, res, next) => {
  try {
    console.log('Verificando token de autenticación...');
    
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1] || req.header('x-auth-token');
    console.log('Token extraído:', token ? 'Presente' : 'No presente');

    if (!token) {
      console.error('No se proporcionó token de autenticación');
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decodificado:', JSON.stringify(decoded, null, 2));
    
    if (!decoded || !decoded.user) {
      console.error('Token inválido: no contiene información del usuario');
      return res.status(401).json({ message: 'Token inválido' });
    }

    // Asegurarse de que el usuario tenga un ID válido
    if (!decoded.user.id) {
      console.error('Token inválido: no contiene ID de usuario');
      return res.status(401).json({ message: 'Token inválido: ID de usuario no encontrado' });
    }

    // Añadir la información del usuario al request
    req.user = {
      id: decoded.user.id,
      email: decoded.user.email,
      rol: decoded.user.rol,
      compania_id: decoded.user.compania_id
    };
    
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error detallado en autenticación:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    res.status(500).json({ 
      message: 'Error en la autenticación',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ msg: 'Acceso prohibido: permisos insuficientes' });
    }
    next();
  };
};

exports.checkCompanyOwnership = async (req, res, next) => {
  try {
    // Si el usuario es Administrador, se le permite el acceso sin ningún chequeo adicional.
    if (req.user.rol === 'Administrador') {
      return next();
    }

    // Para los usuarios con rol "Gerente", se valida que la compañía enviada coincida con la asignada.
    if (req.user.rol === 'Gerente') {
      let companyId;
      
      // Para operaciones de creación (POST)
      if (req.method === 'POST') {
        companyId = req.body.compania || req.body.compania_id;
        // Si no se proporciona en el body, usar la compañía del usuario
        if (!companyId && req.user.compania_id) {
          companyId = req.user.compania_id;
        }
      }
      // Para operaciones de actualización/eliminación (PUT, DELETE)
      else if ((req.method === 'PUT' || req.method === 'DELETE')) {
        if (req.originalUrl.includes('products')) {
          const productId = req.params.id;
          if (productId) {
            const product = await Product.findById(productId);
            if (!product) {
              return res.status(404).json({ msg: 'Producto no encontrado' });
            }
            companyId = product.compania_id.toString();
          }
        } else if (req.originalUrl.includes('brands')) {
          const brandId = req.params.id;
          if (brandId) {
            const brand = await Brand.findById(brandId);
            if (!brand) {
              return res.status(404).json({ msg: 'Marca no encontrada' });
            }
            companyId = brand.compania.toString();
          }
        }
      }
      
      // Si no se pudo obtener el ID de la compañía
      if (!companyId) {
        return res.status(400).json({ msg: 'ID de compañía no proporcionado' });
      }

      // Verificar que la compañía del usuario coincida con la compañía de la operación
      // Solo si el usuario tiene una compañía asignada
      if (req.user.compania_id && companyId.toString() !== req.user.compania_id.toString()) {
        return res.status(403).json({ msg: 'No tienes permisos para realizar esta operación' });
      }
    }

    // Para los usuarios con rol "Usuario", se asume que solo deben acceder a sus propios datos.
    if (req.user.rol === 'Usuario') {
      // Se verifica que el ID del usuario que se pretende modificar/consultar (por ejemplo, enviado en params o body)
      // coincida con el ID del usuario autenticado. Ajusta según la estructura de tus rutas.
      const userIdFromRequest = req.params.userId || req.body.userId;
      if (userIdFromRequest && userIdFromRequest.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json({ msg: 'Acceso prohibido: no puedes acceder a los datos de otro usuario' });
      }
      return next();
    }

    // Si se llega hasta aquí y el rol no es reconocido, se deniega el acceso.
    return res.status(403).json({ msg: 'Acceso prohibido: rol no reconocido' });
  } catch (error) {
    console.error('Error en checkCompanyOwnership:', error);
    res.status(500).json({ msg: 'Error al verificar permisos de compañía' });
  }
};