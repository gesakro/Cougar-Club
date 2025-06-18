const Coupon = require('../models/Coupon');

// Validar un cupón
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    console.log('Validando cupón:', code);
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      console.log('Cupón no encontrado:', code);
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    console.log('Cupón encontrado:', {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      isActive: coupon.isActive,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      hasUsedByMethod: typeof coupon.hasBeenUsedBy === 'function'
    });

    // Verificar si el método isValid existe
    if (typeof coupon.isValid !== 'function') {
      console.error('Método isValid no existe en el cupón:', code);
      return res.status(500).json({ message: 'Error en la estructura del cupón' });
    }

    if (!coupon.isValid()) {
      console.log('Cupón inválido:', code);
      return res.status(400).json({ message: 'Cupón inválido o expirado' });
    }

    // Si el usuario está autenticado, verificar si puede usar el cupón
    if (req.user && req.user.id) {
      const userId = req.user.id;
      console.log('Usuario autenticado:', userId);
      
      // Verificar si el método hasBeenUsedBy existe
      if (typeof coupon.hasBeenUsedBy !== 'function') {
        console.error('Método hasBeenUsedBy no existe en el cupón:', code);
        return res.status(500).json({ message: 'Error en la estructura del cupón' });
      }

      // Verificar si ya ha usado este cupón
      try {
        if (coupon.hasBeenUsedBy(userId)) {
          console.log('Cupón ya usado por el usuario:', userId);
          return res.status(400).json({ message: 'Ya has usado este cupón anteriormente' });
        }
      } catch (methodError) {
        console.error('Error al verificar uso del cupón:', methodError);
        return res.status(500).json({ message: 'Error al verificar el uso del cupón' });
      }

      // Obtener el total gastado del usuario
      try {
        const Purchase = require('../models/Purchase');
        const purchases = await Purchase.find({ usuario_id: userId });
        const totalGastado = purchases.reduce((sum, purchase) => sum + (purchase.totalCompra || 0), 0);

        console.log('Total gastado del usuario:', totalGastado, 'MinPurchase del cupón:', coupon.minPurchase);

        // Verificar si el cupón está bloqueado para este usuario
        if (totalGastado < coupon.minPurchase) {
          console.log('Cupón bloqueado para el usuario');
          return res.status(400).json({ 
            message: `Este cupón requiere una compra mínima de $${coupon.minPurchase} COP. Tu total gastado es $${totalGastado} COP.` 
          });
        }
      } catch (purchaseError) {
        console.error('Error al obtener compras del usuario:', purchaseError);
        return res.status(500).json({ message: 'Error al verificar el historial de compras' });
      }
    }

    // Devolver información del cupón (sin datos sensibles)
    const response = {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount
    };

    console.log('Cupón válido, devolviendo:', response);
    res.json(response);
  } catch (error) {
    console.error('Error detallado al validar cupón:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al validar el cupón',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    const userId = req.user.id;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: 'Cupón inválido o expirado' });
    }

    // Verificar si el usuario ya ha usado este cupón
    if (coupon.hasBeenUsedBy(userId)) {
      return res.status(400).json({ message: 'Ya has usado este cupón anteriormente' });
    }

    const totalAmount = purchaseData.totalCompra;
    const discount = coupon.calculateDiscount(totalAmount);

    // Marcar el cupón como usado por este usuario
    try {
      coupon.markAsUsedBy(userId);
      await coupon.save();
    } catch (markError) {
      console.error('Error al marcar cupón como usado:', markError);
      return res.status(400).json({ message: markError.message });
    }

    res.json({
      discount,
      finalAmount: totalAmount - discount,
      message: 'Cupón aplicado exitosamente'
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
      minPurchase: 200000,
      maxDiscount: 1000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde ahora
      isActive: true,
      usageLimit: 100,
      usageCount: 0,
      usedBy: []
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

// Método para diagnosticar un cupón específico
exports.diagnoseCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    console.log('Diagnosticando cupón:', code);
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no encontrado' });
    }

    // Verificar la estructura completa del cupón
    const diagnosis = {
      exists: true,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minPurchase: coupon.minPurchase,
      maxDiscount: coupon.maxDiscount,
      isActive: coupon.isActive,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
      usedBy: coupon.usedBy,
      hasUsedByMethod: typeof coupon.hasBeenUsedBy === 'function',
      hasIsValidMethod: typeof coupon.isValid === 'function',
      hasCalculateDiscountMethod: typeof coupon.calculateDiscount === 'function',
      hasMarkAsUsedByMethod: typeof coupon.markAsUsedBy === 'function',
      usedByLength: coupon.usedBy ? coupon.usedBy.length : 0,
      usedByStructure: coupon.usedBy ? coupon.usedBy.map(usage => ({
        userId: usage.userId,
        usedAt: usage.usedAt,
        userIdType: typeof usage.userId,
        usedAtType: typeof usage.usedAt
      })) : []
    };

    // Probar métodos si existen
    if (diagnosis.hasIsValidMethod) {
      try {
        diagnosis.isValidResult = coupon.isValid();
      } catch (error) {
        diagnosis.isValidError = error.message;
      }
    }

    if (diagnosis.hasUsedByMethod && req.user && req.user.id) {
      try {
        diagnosis.hasBeenUsedResult = coupon.hasBeenUsedBy(req.user.id);
      } catch (error) {
        diagnosis.hasBeenUsedError = error.message;
      }
    }

    res.json(diagnosis);
  } catch (error) {
    console.error('Error al diagnosticar cupón:', error);
    res.status(500).json({ 
      message: 'Error al diagnosticar el cupón',
      error: error.message,
      stack: error.stack
    });
  }
}; 