// middleware/auth.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.header('x-auth-token')) {
    token = req.header('x-auth-token');
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Se espera que decoded.user contenga: id, email, rol y, en caso de Gerente, compania_id
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
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

exports.checkCompanyOwnership = (req, res, next) => {
  // Si el usuario es Administrador, se le permite el acceso sin ningún chequeo adicional.
  if (req.user.rol === 'Administrador') {
    return next();
  }

  // Para los usuarios con rol "Gerente", se valida que la compañía enviada coincida con la asignada.
  if (req.user.rol === 'Gerente') {
    // Se busca el ID de compañía en diferentes partes de la solicitud
    const companyId =
      req.body.compania ||
      req.body.compania_id ||
      req.params.compania_id ||
      req.query.compania_id;
    if (!companyId) {
      return res.status(400).json({ msg: 'ID de compañía no proporcionado' });
    }
    if (companyId.toString() !== req.user.compania_id?.toString()) {
      return res
        .status(403)
        .json({ msg: 'Acceso prohibido: la compañía no coincide' });
    }
    return next();
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
};
