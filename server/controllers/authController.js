// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  try {
    let { email, password, rol, compania_id, perfil } = req.body;
    
    // Por defecto, el rol es "Usuario"
    rol = rol || 'Usuario';
    
    // Si el rol es Gerente, se requiere compania_id
    if (rol === 'Gerente' && !compania_id) {
      return res.status(400).json({ message: 'El rol de Gerente requiere compania_id' });
    }
    
    // Para los roles Administrador y Usuario, ignoramos compania_id (no debe asignarse)
    if (rol !== 'Gerente') {
      compania_id = undefined;
    }
    
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    user = new User({
      email,
      password: hashedPassword,
      rol,
      compania_id, // Solo estará definido si el rol es Gerente
      perfil
    });
    
    await user.save();
    
    // Incluimos en el token la información relevante, incluida la compañía si existe
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        compania_id: user.compania_id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }
    
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
        compania_id: user.compania_id
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener el perfil del usuario autenticado
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Excluir la contraseña
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar datos personales del usuario autenticado
exports.updateUserProfile = async (req, res) => {
  try {
    const { email, perfil } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, perfil },
      { new: true }
    ).select('-password'); // Excluir la contraseña del resultado

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
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