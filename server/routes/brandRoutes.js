const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Rutas públicas
router.get('/', brandController.getBrands); // Acceso público para consultar marcas
router.get('/:id', brandController.getBrandById);
router.get('/company/:companyId', brandController.getBrandsByCompany);

// Rutas protegidas - simplificadas sin checkCompanyOwnership por ahora
router.post('/', verifyToken, authorizeRole('Administrador', 'Gerente'), brandController.createBrand);
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), brandController.updateBrand);
router.delete('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), brandController.deleteBrand);

module.exports = router;