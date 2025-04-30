const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  compania_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  marca_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand'
  },
  descripcion: { type: String },
  nombre: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  imagen: { type: String },
  categoria: { type: String },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  stock: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Product', ProductSchema);
