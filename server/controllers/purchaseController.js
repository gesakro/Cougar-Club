const Purchase = require('../models/Purchase');

// Crear una compra
exports.createPurchase = async (req, res) => {
  try {
    console.log('📥 createPurchase req.body:', JSON.stringify(req.body, null, 2));

    const purchase = new Purchase(req.body);
    const savedPurchase = await purchase.save();
    res.status(201).json(savedPurchase);
  } catch (error) {
    console.error('🛑 createPurchase error stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
};

// Obtener todas las compras
exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find().populate('productos.producto_id');
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener compras por usuario - ¡AQUÍ ESTÁ EL CAMBIO PRINCIPAL!
exports.getPurchasesByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Se requiere un ID de usuario' });
    }

    // Primero obtenemos los datos SIN populate
    const sinPopulate = await Purchase.find({ usuario_id: userId });
    console.log('📦 Datos SIN populate:', JSON.stringify(sinPopulate, null, 2));

    // Ahora obtenemos los datos CON populate
    const purchases = await Purchase.find({ usuario_id: userId })
      .populate('productos.producto_id');
    console.log('📦 Datos CON populate:', JSON.stringify(purchases, null, 2));

    res.status(200).json(purchases);
  } catch (error) {
    console.error('❌ Error in getPurchasesByUser:', error);
    res.status(500).json({ error: error.message });
  }
};


// Obtener una compra por ID
exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('productos.producto_id');
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
    ).populate('productos.producto_id');
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

module.exports = {
  createPurchase: exports.createPurchase,
  getPurchases: exports.getPurchases,
  getPurchasesByUser: exports.getPurchasesByUser,
  getPurchaseById: exports.getPurchaseById,
  updatePurchase: exports.updatePurchase,
  deletePurchase: exports.deletePurchase,
};