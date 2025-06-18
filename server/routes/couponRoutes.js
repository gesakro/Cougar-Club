const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken } = require('../middlewares/auth');

// Middleware de autenticación opcional
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    verifyToken(req, res, next);
  } else {
    next();
  }
};

// Crear cupón de prueba (solo para desarrollo)
router.post('/create-test', couponController.createTestCoupon);

// Validar un cupón (con autenticación opcional)
router.get('/validate/:code', optionalAuth, couponController.validateCoupon);

// Obtener cupones del usuario (requiere autenticación)
router.get('/user', verifyToken, couponController.getUserCoupons);

// Diagnosticar un cupón específico (solo para desarrollo)
router.get('/diagnose/:code', optionalAuth, couponController.diagnoseCoupon);

// Aplicar un cupón a una compra (requiere autenticación)
router.post('/apply', verifyToken, couponController.applyCoupon);

module.exports = router; 