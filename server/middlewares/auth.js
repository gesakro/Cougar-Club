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
    req.user = decoded.user; // Contendrá id, email, rol y, si aplica, compania_id
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

// Middleware para comprobar que la entidad que se está gestionando
// corresponde a la compañía del Gerente (solo para usuarios con rol "Gerente")
exports.checkCompanyOwnership = (req, res, next) => {
  if (req.user.rol === 'Gerente') {
    // Suponemos que en una entidad relacionada a una compañía, el ID de la compañía se transmite en:
    // req.body.compania o req.body.compania_id. Ajusta según cada modelo.
    const companyIdFromBody = req.body.compania || req.body.compania_id;
    if (!companyIdFromBody || companyIdFromBody.toString() !== req.user.compania_id.toString()) {
      return res.status(403).json({ msg: 'Acceso prohibido: la compañía no coincide' });
    }
  }
  next();
};
