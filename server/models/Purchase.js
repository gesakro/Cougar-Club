const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema(
  {
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    compania_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    totalCompra: {
      type: Number,
      required: true
    },
    estadoCompra: {
      type: String,
      enum: ['Pendiente', 'Completado'],
      default: 'Pendiente'
    },
    metodoPago: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', PurchaseSchema);
