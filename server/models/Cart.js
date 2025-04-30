const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productos: [
    {
      producto_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      cantidad: {
        type: Number,
        default: 1
      }
    }
  ],
  compania_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  fechaAdherido: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
