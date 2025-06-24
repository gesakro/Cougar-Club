const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es requerido'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
  },
  nombre: {
    type: String,
    trim: true,
    default: ''
  },
  apellido: {
    type: String,
    trim: true,
    default: ''
  },
  perfil: {
    nombre: {
      type: String,
      trim: true,
      default: ''
    },
    telefono: {
      type: String,
      trim: true,
      default: ''
    },
    direccion: {
      type: String,
      trim: true,
      default: ''
    }
  },
  rol: {
    type: String,
    enum: ['Administrador', 'Gerente', 'Usuario'],
    default: 'Usuario'
  },
  compania_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpires: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para hashear la contraseña en actualizaciones
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.$set.password = await bcrypt.hash(update.$set.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
