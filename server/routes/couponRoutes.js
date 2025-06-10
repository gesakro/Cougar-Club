const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken } = require('../middlewares/auth');

// Crear cupón de prueba (solo para desarrollo)
router.post('/create-test', couponController.createTestCoupon);

// Validar un cupón
router.get('/validate/:code', couponController.validateCoupon);

// Obtener cupones del usuario (requiere autenticación)
router.get('/user', verifyToken, couponController.getUserCoupons);

// Aplicar un cupón a una compra (requiere autenticación)
router.post('/apply', verifyToken, couponController.applyCoupon);

module.exports = router; 