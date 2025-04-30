// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyToken, authorizeRole, checkCompanyOwnership } = require('../middlewares/auth');

// Crear, actualizar y eliminar marcas:
// Se permite acceso a Administradores o Gerentes. En el caso de Gerentes, se valida la compañía.
router.post('/', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.createBrand);
router.get('/', verifyToken, authorizeRole('Administrador', 'Gerente'), brandController.getBrands);
router.get('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), brandController.getBrandById);
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.updateBrand);
router.delete('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.deleteBrand);

module.exports = router;
