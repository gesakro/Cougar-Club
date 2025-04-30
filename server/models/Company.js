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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', CompanySchema);
