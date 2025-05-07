const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyToken, authorizeRole, checkCompanyOwnership } = require('../middlewares/auth');

// Crear, actualizar y eliminar marcas:
// Se permite acceso a Administradores o Gerentes. En el caso de Gerentes, se valida la compañía.
router.post('/', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.createBrand);
router.get('/', brandController.getBrands); // Acceso público para consultar marcas
router.get('/:id', brandController.getBrandById);
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.updateBrand);
router.delete('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, brandController.deleteBrand);

// Ruta adicional para obtener marcas por compañía específica
router.get('/company/:companyId', brandController.getBrandsByCompany);

module.exports = router;