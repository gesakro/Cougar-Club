const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    plan: {
      type: String,
      enum: ['Mensual', 'Anual'],
      default: 'Mensual'
    },
    imagenBanner: {
      type: String // URL de la imagen banner
    },
    imagenPerfil: {
      type: String // URL de la imagen de perfil
    },
    productos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);