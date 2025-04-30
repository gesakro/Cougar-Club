const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// Crear un carrito
router.post('/', cartController.createCart);

// Obtener el carrito de un usuario (ej.: /api/carts/user/USER_ID)
router.get('/user/:userId', cartController.getCartByUser);

// Actualizar el carrito por su ID
router.put('/:id', cartController.updateCart);

// Eliminar el carrito por su ID
router.delete('/:id', cartController.deleteCart);

module.exports = router;
