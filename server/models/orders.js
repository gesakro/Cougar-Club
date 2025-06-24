const mongoose = require('mongoose');

// Definición del esquema de la colección "orders"
const orderSchema = new mongoose.Schema({
  fechaCreacion: {
    type: Date,
    default: Date.now,
    required: true
  },
  precioTotal: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'finalizado', 'cancelada'],
    default: 'pendiente',
    required: true
  }
});

// Exportamos el modelo usando el nombre exacto "orders"
module.exports = mongoose.model('orders', orderSchema); 