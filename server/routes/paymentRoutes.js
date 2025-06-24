const express = require('express');
const router = express.Router();
const { createPayment } = require('../controllers/paymentController');

// Ruta para procesar pagos desde MercadoPago Brick
router.post('/create', createPayment);

module.exports = router; 