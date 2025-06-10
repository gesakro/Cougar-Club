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
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es requerido'],
    trim: true
  },
  rol: {
    type: String,
    enum: ['Administrador', 'Gerente', 'Usuario'],
    default: 'Usuario'
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
    console.log('Comparando contraseñas para usuario:', this.email);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Resultado de comparación:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error al comparar contraseñas:', error);
    throw error;
  }
};

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hasheando contraseña para usuario:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Contraseña hasheada correctamente');
    next();
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    next(error);
  }
});

// Middleware para hashear la contraseña en actualizaciones
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update && update.$set && update.$set.password) {
    try {
      console.log('Hasheando contraseña en actualización');
      const salt = await bcrypt.genSalt(10);
      update.$set.password = await bcrypt.hash(update.$set.password, salt);
      console.log('Contraseña hasheada correctamente en actualización');
    } catch (error) {
      console.error('Error al hashear contraseña en actualización:', error);
      return next(error);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
