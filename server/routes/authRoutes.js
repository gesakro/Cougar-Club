// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
// Importa con desestructuración para extraer verifyToken
const { verifyToken } = require('../middlewares/auth'); // O '../middlewares/auth' si tu carpeta se llama "middlewares"
const userController = require('../controllers/userController');

// Ruta para registrar un nuevo usuario (Sign Up)
router.post('/signup', authController.signup);

// Ruta para autenticar un usuario existente (Login)
router.post('/login', authController.login);

// Obtener perfil del usuario autenticado
router.get('/me', verifyToken, userController.getUserProfile);

// Actualizar datos del usuario autenticado
router.put('/me', verifyToken, userController.updateUserProfile);

// Eliminar cuenta del usuario autenticado
router.delete('/me', verifyToken, userController.deleteUserAccount);

module.exports = router;
