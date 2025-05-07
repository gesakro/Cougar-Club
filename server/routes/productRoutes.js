const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, authorizeRole, checkCompanyOwnership } = require('../middlewares/auth');

// Rutas básicas para productos con autenticación
router.post('/', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, productController.createProduct);
router.get('/', productController.getProducts); // Acceso público para ver productos
router.get('/:id', productController.getProductById);
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), checkCompanyOwnership, productController.deleteProduct);

// Ruta adicional para obtener productos por marca
router.get('/brand/:marca_id', productController.getProductsByBrand);

module.exports = router;