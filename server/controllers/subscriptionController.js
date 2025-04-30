const Subscription = require('../models/Subscription');

// Crear una suscripción
exports.createSubscription = async (req, res) => {
  try {
    const subscription = new Subscription(req.body);
    const savedSubscription = await subscription.save();
    res.status(201).json(savedSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las suscripciones
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una suscripción por ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription)
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una suscripción
exports.updateSubscription = async (req, res) => {
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSubscription)
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    res.json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una suscripción
exports.deleteSubscription = async (req, res) => {
  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(req.params.id);
    if (!deletedSubscription)
      return res.status(404).json({ message: 'Suscripción no encontrada' });
    res.json({ message: 'Suscripción eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
