const Coupon = require('../models/Coupon');

// Validar un cupón
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Cupón inválido o expirado' });
    }

    // Devolver información del cupón (sin datos sensibles)
    res.json({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount
    });
  } catch (error) {
    console.error('Error al validar cupón:', error);
    res.status(500).json({ message: 'Error al validar el cupón' });
  }
};

// Obtener cupones del usuario
exports.getUserCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const coupons = await Coupon.find({ 
      userId,
      isActive: true,
      endDate: { $gte: new Date() }
    });

    res.json(coupons.map(coupon => ({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      endDate: coupon.endDate
    })));
  } catch (error) {
    console.error('Error al obtener cupones del usuario:', error);
    res.status(500).json({ message: 'Error al obtener los cupones' });
  }
};

// Aplicar un cupón a una compra
exports.applyCoupon = async (req, res) => {
  try {
    const { code, purchaseData } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Cupón inválido o expirado' });
    }

    const totalAmount = purchaseData.totalCompra;
    const discount = coupon.calculateDiscount(totalAmount);

    // Incrementar el contador de uso
    coupon.usageCount += 1;
    await coupon.save();

    res.json({
      discount,
      finalAmount: totalAmount - discount
    });
  } catch (error) {
    console.error('Error al aplicar cupón:', error);
    res.status(500).json({ message: 'Error al aplicar el cupón' });
  }
};

// Crear un cupón de prueba
exports.createTestCoupon = async (req, res) => {
  try {
    const testCoupon = new Coupon({
      code: 'PLATINUM25',
      type: 'percentage',
      value: 25,
      minPurchase: 0,
      maxDiscount: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde ahora
      isActive: true,
      usageLimit: 100,
      usageCount: 0
    });

    await testCoupon.save();
    res.status(201).json({
      message: 'Cupón de prueba creado exitosamente',
      coupon: {
        code: testCoupon.code,
        type: testCoupon.type,
        value: testCoupon.value,
        minPurchase: testCoupon.minPurchase,
        maxDiscount: testCoupon.maxDiscount,
        endDate: testCoupon.endDate
      }
    });
  } catch (error) {
    console.error('Error al crear cupón de prueba:', error);
    res.status(500).json({ message: 'Error al crear el cupón de prueba' });
  }
}; 