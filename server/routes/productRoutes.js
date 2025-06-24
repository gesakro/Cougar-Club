// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const uploadController = require('../controllers/uploadController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Ruta para subir imagen del producto
router.post(
  '/upload-image',
  uploadController.uploadProductImageMiddleware,
  uploadController.uploadProductImage
);

// Resto de tus rutas de productos...
router.post('/', verifyToken, authorizeRole('Administrador', 'Gerente'), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), productController.updateProduct);
router.delete('/:id', verifyToken, authorizeRole('Administrador', 'Gerente'), productController.deleteProduct);

// Rutas para gestión de stock
router.post('/:productId/check-stock', productController.checkStock);
router.post('/:productId/update-stock', verifyToken, productController.updateStock);

module.exports = router;