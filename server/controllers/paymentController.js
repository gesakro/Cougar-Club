const mercadopago = require('mercadopago');
const Order = require('../models/orders');

// Configurar SDK de MercadoPago con el access token
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

/**
 * Procesa el pago recibido desde el Payment Brick y registra la orden
 * La request debe incluir: token, payment_method_id, issuer_id, email, amount, installments
 */
exports.createPayment = async (req, res) => {
  try {
    console.log('Pago recibido:', req.body);
    // Si viene anidado dentro de formData, tomar ese objeto
    const source = req.body.formData ? req.body.formData : req.body;

    // Normalizar nombres que llegan del Payment Brick
    const token = source.token;
    const payment_method_id = source.payment_method_id || source.paymentMethodId;
    const issuer_id = source.issuer_id || source.issuerId;
    const installments = source.installments || 1;
    const amount = source.amount || source.transaction_amount;
    const payer = source.payer || {};
    const directEmail = source.email;

    // Obtener email ya sea directo o dentro de payer
    const email = directEmail || payer.email;

    if (!payment_method_id || !amount) {
      return res.status(400).json({ error: 'payment_method_id y amount son obligatorios' });
    }

    let paymentData;

    if (payment_method_id === 'pse') {
      // Flujo PSE (no requiere token)
      const { transaction_details } = source;

      if (!transaction_details?.financial_institution || !email) {
        return res.status(400).json({ error: 'Datos de PSE incompletos' });
      }

      paymentData = {
        transaction_amount: Number(amount),
        payment_method_id: 'pse',
        description: 'Compra en Cougar Club',
        payer: {
          ...payer,
          email
        },
        callback_url: process.env.PSE_CALLBACK_URL || 'https://www.example.com',
        notification_url: process.env.PSE_NOTIFICATION_URL || 'https://www.example.com/ipn',
        transaction_details,
        additional_info: {
          ip_address: (req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress || '127.0.0.1'
        }
      };
    } else if (
      payment_method_id === 'efecty' ||
      payment_method_id === 'baloto' ||
      payment_method_id === 'gana'
    ) {
      // Flujo efectivo (Efecty, Baloto, Gana)
      if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio para pagos en efectivo' });
      }
      paymentData = {
        transaction_amount: Number(amount),
        payment_method_id,
        description: 'Compra en Cougar Club',
        payer: { email }
      };
    } else {
      // Flujo tarjetas (requiere token)
      if (!token || !email) {
        return res.status(400).json({ error: 'Faltan datos obligatorios para pagos con tarjeta' });
      }

      paymentData = {
        transaction_amount: Number(amount),
        token,
        description: 'Compra en Cougar Club',
        installments: Number(installments),
        payment_method_id,
        payer: {
          email
        }
      };

      if (issuer_id) {
        paymentData.issuer_id = issuer_id;
      }
    }

    let paymentResponse;
    let status, status_detail;
    try {
      paymentResponse = await mercadopago.payment.create(paymentData);
      status = paymentResponse.body.status;
      status_detail = paymentResponse.body.status_detail;
    } catch (err) {
      // Si es PSE en modo prueba, simular respuesta aprobada
      if (payment_method_id === 'pse' && process.env.NODE_ENV !== 'production') {
        status = 'approved';
        status_detail = 'fake_approved';
        paymentResponse = { body: { id: 'fake-pse-' + Date.now() } };
      } else {
        throw err;
      }
    }

    // Registrar la orden en la base de datos
    const order = new Order({
      precioTotal: amount,
      estado: status === 'approved' ? 'finalizado' : status === 'in_process' ? 'pendiente' : 'cancelada'
    });
    await order.save();

    // Modo pasarela ficticia
    if (process.env.USE_FAKE_GATEWAY === 'true') {
      const fakeStatus = 'approved';
      const fakeDetail = 'fake_approved';

      // Guardar la orden en BD como finalizada
      const order = new Order({
        precioTotal: req.body.amount || 0,
        estado: 'finalizado'
      });
      await order.save();

      return res.json({
        status: fakeStatus,
        status_detail: fakeDetail,
        orderId: order._id,
        payment: { id: 'fake-' + Date.now() }
      });
    }

    return res.status(200).json({
      status,
      status_detail,
      orderId: order._id,
      payment: paymentResponse ? paymentResponse.body : { id: 'fake-' + Date.now() }
    });
  } catch (error) {
    console.error('Error al crear el pago:', error);
    return res.status(500).json({ error: 'Ocurrió un problema al procesar el pago' });
  }
}; 