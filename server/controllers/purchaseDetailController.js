const PurchaseDetail = require('../models/PurchaseDetail');

// Crear un detalle de compra
exports.createPurchaseDetail = async (req, res) => {
  try {
    const detail = new PurchaseDetail(req.body);
    const savedDetail = await detail.save();
    res.status(201).json(savedDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener detalles de compra por ID de compra
exports.getPurchaseDetailsByPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const details = await PurchaseDetail.find({ compra_id: purchaseId }).populate('producto_id');
    res.json(details);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un detalle de compra
exports.updatePurchaseDetail = async (req, res) => {
  try {
    const updatedDetail = await PurchaseDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDetail)
      return res.status(404).json({ message: 'Detalle de compra no encontrado' });
    res.json(updatedDetail);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un detalle de compra
exports.deletePurchaseDetail = async (req, res) => {
  try {
    const deletedDetail = await PurchaseDetail.findByIdAndDelete(req.params.id);
    if (!deletedDetail)
      return res.status(404).json({ message: 'Detalle de compra no encontrado' });
    res.json({ message: 'Detalle de compra eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
