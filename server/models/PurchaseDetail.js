const mongoose = require('mongoose');

const PurchaseDetailSchema = new mongoose.Schema(
  {
    compra_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      required: true
    },
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    precio: {
      type: Number,
      required: true
    },
    cantidad: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PurchaseDetail', PurchaseDetailSchema);
