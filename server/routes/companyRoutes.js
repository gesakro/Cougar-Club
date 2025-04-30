// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Crear compañía: solo Administrador
router.post('/', verifyToken, authorizeRole('Administrador'), companyController.createCompany);

// Obtener todas las compañías: solo Administrador
router.get('/', verifyToken, authorizeRole('Administrador'), companyController.getCompanies);

// Obtener compañía por ID: Administrador o Gerente (el Gerente solo puede ver su compañía)
router.get('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), async (req, res, next) => {
  if (req.user.rol === 'Gerente' && req.user.compania_id.toString() !== req.params.id) {
    return res.status(403).json({ msg: 'Acceso prohibido: no puedes acceder a esta compañía' });
  }
  next();
}, companyController.getCompanyById);

// Actualizar compañía: Administrador o Gerente (el Gerente solo puede actualizar su compañía)
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), async (req, res, next) => {
  if (req.user.rol === 'Gerente' && req.user.compania_id.toString() !== req.params.id) {
    return res.status(403).json({ msg: 'Acceso prohibido: no puedes modificar esta compañía' });
  }
  next();
}, companyController.updateCompany);

// Eliminar compañía: solo Administrador
router.delete('/:id', verifyToken, authorizeRole('Administrador'), companyController.deleteCompany);

module.exports = router;
