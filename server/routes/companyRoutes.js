// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken, authorizeRole, checkCompanyOwnership } = require('../middlewares/auth');

// Crear compañía: solo Administrador
router.post('/', verifyToken, authorizeRole('Administrador'), companyController.createCompany);

// Obtener todas las compañías (sin restricciones, pero podrías aplicar filtros si lo requieres)
router.get('/', companyController.getCompanies);

// Obtener compañía por ID
// Ahora se verifica token y propiedad: los Gerentes solo podrán acceder a su compañía, mientras el Administrador puede acceder a cualquiera.
router.get('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, companyController.getCompanyById);

// Obtener compañía con sus marcas y productos asociados, también restringido
router.get('/:id/detail', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, companyController.getCompanyDetail);

// Actualizar compañía por ID: Administrador o Gerente (el Gerente solo puede modificar su compañía)
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, companyController.updateCompany);

// Eliminar compañía: solo Administrador
router.delete('/:id', verifyToken, authorizeRole('Administrador'), companyController.deleteCompany);

module.exports = router;
