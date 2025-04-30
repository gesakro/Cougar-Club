const Purchase = require('../models/Purchase');

// Crear una compra
exports.createPurchase = async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    const savedPurchase = await purchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las compras
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una compra por ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase)
      return res.status(404).json({ message: 'Compra no encontrada' });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una compra por ID
exports.updatePurchase = async (req, res) => {
  try {
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPurchase)
      return res.status(404).json({ message: 'Compra no encontrada' });
    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una compra por ID
exports.deletePurchase = async (req, res) => {
  try {
    const deletedPurchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!deletedPurchase)
      return res.status(404).json({ message: 'Compra no encontrada' });
    res.json({ message: 'Compra eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
