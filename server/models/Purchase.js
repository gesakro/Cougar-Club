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
    // 🔥 AGREGAR: Array de productos comprados
    productos: [{
      producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // ← Asegúrate de que coincida con tu modelo de producto
        required: true
      },
      cantidad: {
        type: Number,
        required: true,
        min: 1
      },
      precioUnitario: {
        type: Number,
        required: true
      }
    }],
    totalCompra: {
      type: Number,
      required: true
    },
    // 🔥 CAMBIAR: Usar el mismo nombre que en el frontend
    estado: {
      type: String,
      enum: ['pendiente', 'completado', 'cancelado', 'enviado', 'entregado'],
      default: 'pendiente'
    },
    // 🔥 AGREGAR: Campos que tu frontend espera
    envio: {
      type: Number,
      default: 0
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    metodoPago: { 
      type: String 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Purchase', PurchaseSchema);