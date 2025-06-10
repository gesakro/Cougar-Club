const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'No se proporcionó un token de autenticación'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Agregar el usuario decodificado a la request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({
      message: 'Token inválido o expirado'
    });
  }
}; 