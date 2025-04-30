// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar un nuevo usuario (Sign Up)
router.post('/signup', authController.signup);

// Ruta para autenticar un usuario existente (Login)
router.post('/login', authController.login);

module.exports = router;
