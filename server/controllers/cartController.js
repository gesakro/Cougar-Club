const Cart = require('../models/Cart');

// Crear un nuevo carrito
exports.createCart = async (req, res) => {
  try {
    const cart = new Cart(req.body);
    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener el carrito de un usuario (buscando por usuario_id)
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ usuario_id: userId }).populate('productos.producto_id');
    if (!cart)
      return res.status(404).json({ message: 'Carrito no encontrado para este usuario' });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un carrito por su ID
exports.updateCart = async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCart)
      return res.status(404).json({ message: 'Carrito no encontrado' });
    res.json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un carrito por su ID
exports.deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart)
      return res.status(404).json({ message: 'Carrito no encontrado' });
    res.json({ message: 'Carrito eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
