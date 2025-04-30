const mongoose = require('mongoose');

const HistorialCompraSchema = new mongoose.Schema(
  {
    producto_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    cantidad: Number,
    precio: Number,
    estado: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    metodoPago: String,
    compania_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    estadoCompra: {
      type: String,
      enum: ['Completado', 'Cancelado', 'Pendiente']
    }
  },
  { _id: false }
);


const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true // Recuerda hashearla en producción
    },
    rol: {
      type: String,
      enum: ['Administrador', 'Gerente', 'Usuario'],
      default: 'Usuario'
    },
    compania_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: function () {
        // Solo se requiere compania_id si el usuario es Gerente
        return this.rol === 'Gerente';
      }
    },
    perfil: {
      nombre: { type: String }
    },
    historialCompras: [HistorialCompraSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
