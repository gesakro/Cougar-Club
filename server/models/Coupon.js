const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number
  },
  usageCount: {
    type: Number,
    default: 0
  },
  // Array de usuarios que han usado el cupón
  usedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para validar si el cupón es válido
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

// Método para verificar si un usuario ya ha usado el cupón
couponSchema.methods.hasBeenUsedBy = function(userId) {
  return this.usedBy.some(usage => 
    usage.userId.toString() === userId.toString()
  );
};

// Método para marcar el cupón como usado por un usuario
couponSchema.methods.markAsUsedBy = function(userId) {
  // Verificar si ya fue usado por este usuario
  if (this.hasBeenUsedBy(userId)) {
    throw new Error('Este cupón ya ha sido usado por el usuario');
  }

  // Agregar el uso al array
  this.usedBy.push({
    userId: userId,
    usedAt: new Date()
  });

  // Incrementar el contador de uso
  this.usageCount += 1;
};

// Método para calcular el descuento
couponSchema.methods.calculateDiscount = function(totalAmount) {
  let discount = this.type === 'percentage' 
    ? (totalAmount * this.value) / 100
    : this.value;

  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }

  return discount;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon; 