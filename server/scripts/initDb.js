require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');

const initDb = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    // Array de cupones a crear
    const coupons = [
      {
        code: 'BRONZE10',
        type: 'percentage',
        value: 10,
        minPurchase: 50,
        maxDiscount: 500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        usageLimit: 200,
        usageCount: 0,
        description: 'Cupón Bronce - 10% de descuento'
      },
      {
        code: 'SILVER15',
        type: 'percentage',
        value: 15,
        minPurchase: 100,
        maxDiscount: 750,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        usageLimit: 150,
        usageCount: 0,
        description: 'Cupón Plata - 15% de descuento'
      },
      {
        code: 'GOLD25',
        type: 'percentage',
        value: 25,
        minPurchase: 200,
        maxDiscount: 1000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        usageLimit: 100,
        usageCount: 0,
        description: 'Cupón Oro - 25% de descuento'
      },
      {
        code: 'PLATINUM35',
        type: 'percentage',
        value: 35,
        minPurchase: 300,
        maxDiscount: 1500,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        isActive: true,
        usageLimit: 50,
        usageCount: 0,
        description: 'Cupón Platino - 35% de descuento'
      }
    ];

    // Eliminar cupones existentes (opcional)
    await Coupon.deleteMany({});
    console.log('Cupones existentes eliminados');

    // Crear los nuevos cupones
    for (const couponData of coupons) {
      const coupon = new Coupon(couponData);
      await coupon.save();
      console.log(`Cupón ${couponData.code} creado exitosamente`);
    }

    console.log('Todos los cupones han sido creados');

    // Desconectar de MongoDB
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Ejecutar la función
initDb(); 