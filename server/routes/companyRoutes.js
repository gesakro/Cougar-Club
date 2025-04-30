// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Crear compañía: solo Administrador
router.post('/', companyController.createCompany);

// Obtener todas las compañías (sin restricciones)
router.get('/', companyController.getCompanies);

// Obtener compañía por ID (sin restricciones)
// Se eliminó la validación extra para que los Gerentes solo puedan acceder a su compañía
router.get('/:id', companyController.getCompanyById);

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
