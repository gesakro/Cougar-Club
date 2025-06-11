const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Purchase = require('../models/Purchase');
const Coupon = require('../models/Coupon');

// Crear un usuario
exports.createUser = async (req, res) => {
  try {
    // Verificar si el usuario ya existe
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Hash de la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      rol: req.body.rol || 'Usuario',
      compania_id: req.body.compania_id,
      perfil: req.body.perfil
    });
    const savedUser = await user.save();
    
    // Excluir la contraseña de la respuesta
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar usuario por ID
exports.updateUser = async (req, res) => {
  try {
    // Si se está actualizando la contraseña, hashearla primero
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    
    if (!updatedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar usuario por ID
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener perfil del usuario autenticado
exports.getUserProfile = async (req, res) => {
  try {
    console.log('Obteniendo perfil para usuario:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('No se encontró información del usuario en la request');
      return res.status(401).json({ message: 'No se encontró información del usuario' });
    }

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      console.error('Usuario no encontrado:', req.user.id);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Asegurarse de que el perfil tenga todos los campos necesarios
    const profile = {
      id: user._id,
      email: user.email,
      nombre: user.perfil?.nombre || '',
      telefono: user.perfil?.telefono || '',
      direccion: user.perfil?.direccion || '',
      rol: user.rol,
      compania_id: user.compania_id
    };

    console.log('Perfil encontrado:', profile);
    res.json(profile);
  } catch (error) {
    console.error('Error detallado al obtener perfil:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de usuario inválido',
        error: error.message
      });
    }
    res.status(500).json({ 
      message: 'Error al obtener el perfil del usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Actualizar perfil del usuario autenticado
exports.updateUserProfile = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    
    // Validar que el usuario existe
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar campos del perfil
    if (!user.perfil) {
      user.perfil = {};
    }

    // Actualizar campos solo si se proporcionan
    if (nombre !== undefined) {
      user.perfil.nombre = nombre;
      user.nombre = nombre; // También actualizar el nombre principal
    }
    if (telefono !== undefined) user.perfil.telefono = telefono;
    if (direccion !== undefined) user.perfil.direccion = direccion;
    if (email !== undefined) user.email = email;

    // Guardar los cambios sin validación estricta
    await user.save({ validateBeforeSave: false });

    // Preparar la respuesta
    const updatedProfile = {
      id: user._id,
      email: user.email,
      nombre: user.perfil?.nombre || user.nombre || '',
      telefono: user.perfil?.telefono || '',
      direccion: user.perfil?.direccion || '',
      rol: user.rol,
      compania_id: user.compania_id
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el perfil del usuario',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Eliminar cuenta del usuario autenticado
exports.deleteUserAccount = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas del usuario
exports.getUserStats = async (req, res) => {
  try {
    console.log('Obteniendo estadísticas para usuario:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('No se encontró información del usuario en la request');
      return res.status(401).json({ message: 'No se encontró información del usuario' });
    }

    const userId = req.user.id;
    
    // Obtener todas las compras del usuario
    const purchases = await Purchase.find({ usuario_id: userId });
    console.log('Compras encontradas:', purchases.length);
    
    // Calcular estadísticas
    const totalCompras = purchases.length;
    const totalGastado = purchases.reduce((sum, purchase) => sum + (purchase.totalCompra || 0), 0);
    
    const stats = {
      totalCompras,
      totalGastado,
      ultimaCompra: purchases.length > 0 ? purchases[purchases.length - 1].fecha : null
    };

    console.log('Estadísticas calculadas:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error detallado al obtener estadísticas:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de usuario inválido',
        error: error.message
      });
    }
    res.status(500).json({ 
      message: 'Error al obtener las estadísticas del usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener cupones del usuario
exports.getUserCoupons = async (req, res) => {
  try {
    console.log('Obteniendo cupones para usuario:', req.user);
    
    if (!req.user || !req.user.id) {
      console.error('No se encontró información del usuario en la request');
      return res.status(401).json({ message: 'No se encontró información del usuario' });
    }

    const userId = req.user.id;
    
    // Obtener todas las compras del usuario para calcular el total gastado
    const purchases = await Purchase.find({ usuario_id: userId });
    console.log('Compras encontradas para cupones:', purchases.length);
    
    const totalGastado = purchases.reduce((sum, purchase) => sum + (purchase.totalCompra || 0), 0);
    console.log('Total gastado:', totalGastado);
    
    // Obtener todos los cupones activos
    const allCoupons = await Coupon.find({ 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    console.log('Cupones activos encontrados:', allCoupons.length);
    
    // Separar cupones disponibles y bloqueados
    const availableCoupons = allCoupons.filter(coupon => totalGastado >= coupon.minPurchase);
    const lockedCoupons = allCoupons.filter(coupon => totalGastado < coupon.minPurchase);
    
    const response = {
      available: availableCoupons,
      locked: lockedCoupons,
      totalGastado
    };

    console.log('Cupones disponibles:', availableCoupons.length);
    console.log('Cupones bloqueados:', lockedCoupons.length);
    
    res.json(response);
  } catch (error) {
    console.error('Error detallado al obtener cupones:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de usuario inválido',
        error: error.message
      });
    }
    res.status(500).json({ 
      message: 'Error al obtener los cupones del usuario',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};