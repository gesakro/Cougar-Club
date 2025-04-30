const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema(
  {
    compania_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    tipo: {
      type: String,
      enum: ['Mensual', 'Anual'],
      required: true
    },
    precio: {
      type: Number,
      required: true
    },
    estado: {
      type: String,
      enum: ['Activo', 'Vencido', 'Cancelado'],
      default: 'Activo'
    },
    fechaInicio: {
      type: Date,
      required: true
    },
    fechaFin: {
      type: Date,
      required: true
    },
    infoPago: {
      metodoPago: { type: String },
      transaccion_id: { type: mongoose.Schema.Types.ObjectId }
    },
    periodoContratado: {
      fechaInicio: { type: Date },
      fechaFin: { type: Date }
    },
    transaccion_id: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', SubscriptionSchema);
