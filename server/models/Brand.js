const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema(
  {
    compania: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    nombre: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', BrandSchema);
