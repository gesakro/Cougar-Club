// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const auth = require('../middlewares/auth');

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar la conexión del transporter
transporter.verify(function(error, success) {
  if (error) {
    console.log('Error al conectar con el servidor de correo:', error);
  } else {
    console.log('Servidor de correo listo para enviar mensajes');
  }
});

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { email, password, nombre, apellido, rol } = req.body;

    // Verificar si el usuario ya existe
    let usuario = await User.findOne({ email: email.toLowerCase() });
    if (usuario) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario
    usuario = new User({
      email: email.toLowerCase(),
      password,
      nombre,
      apellido,
      rol: rol || 'Usuario' // Si no se especifica rol, se asigna 'Usuario'
    });

    await usuario.save();

    // Generar token
    const token = jwt.sign(
      { 
        user: {
          id: usuario._id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Registrar un nuevo gerente (público)
exports.registerManager = async (req, res) => {
  try {
    const { email, password, nombre, apellido } = req.body;

    // Verificar si el usuario ya existe
    let usuario = await User.findOne({ email: email.toLowerCase() });
    if (usuario) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear nuevo usuario gerente
    usuario = new User({
      email: email.toLowerCase(),
      password,
      rol: 'Gerente',
      perfil: {
        nombre: nombre || '',
        apellido: apellido || ''
      }
    });

    await usuario.save();

    // Generar token
    const token = jwt.sign(
      { 
        user: {
          id: usuario._id,
          email: usuario.email,
          nombre: usuario.perfil.nombre,
          apellido: usuario.perfil.apellido,
          rol: usuario.rol,
          compania_id: usuario.compania_id
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.perfil.nombre,
        apellido: usuario.perfil.apellido,
        rol: usuario.rol,
        compania_id: usuario.compania_id
      }
    });
  } catch (error) {
    console.error('Error en registro de gerente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar que se proporcionen los campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Por favor, proporciona email y contraseña' 
      });
    }

    // Buscar usuario por email
    const usuario = await User.findOne({ email: email.toLowerCase().trim() });
    if (!usuario) {
      console.log('Usuario no encontrado:', email);
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const isMatch = await usuario.comparePassword(password);
    if (!isMatch) {
      console.log('Contraseña incorrecta para usuario:', email);
      return res.status(400).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Generar token
    const token = jwt.sign(
      { 
        user: {
          id: usuario._id,
          email: usuario.email,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          rol: usuario.rol,
          compania_id: usuario.compania_id
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Enviar respuesta
    res.json({
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        compania_id: usuario.compania_id
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error en el servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

// Solicitar restablecimiento de contraseña
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con este email' });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    
    // Actualizar usuario con el token usando findOneAndUpdate
    await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        resetToken: token,
        resetTokenExpires: Date.now() + 3600000 // 1 hora
      },
      { new: true, runValidators: false }
    );

    // Crear URL de restablecimiento con protocolo y host
    const baseUrl = process.env.FRONTEND_URL || 'https://cougar-club-cojsco-dm1f.vercel.app';
    console.log('URL base para reset:', baseUrl); // Para debugging
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    // Configurar email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Restablecimiento de Contraseña - Cougar Club',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #73614C; text-align: center;">Restablecimiento de Contraseña</h2>
          <p>Hola ${user.nombre},</p>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #73614C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p>Este enlace expirará en 1 hora por razones de seguridad.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Este es un mensaje automático, por favor no respondas a este email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Se ha enviado un enlace de restablecimiento a tu correo electrónico' });
  } catch (error) {
    console.error('Error al solicitar restablecimiento:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud de restablecimiento' });
  }
};

// Verificar código de restablecimiento
exports.verifyResetCode = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);
    const { email, code } = req.body;

    // Validar que se proporcionaron todos los campos necesarios
    if (!email || !code) {
      console.log('Faltan campos requeridos:', { email: !!email, code: !!code });
      return res.status(400).json({
        message: 'Se requiere el email y el código de verificación'
      });
    }

    // Primero buscar el usuario por email
    const usuario = await User.findOne({ email });
    console.log('Usuario encontrado por email:', {
      encontrado: !!usuario,
      email,
      resetToken: usuario?.resetToken,
      resetTokenExpires: usuario?.resetTokenExpires,
      ahora: new Date()
    });

    if (!usuario) {
      return res.status(400).json({
        message: 'Código inválido o expirado'
      });
    }

    // Verificar el código y la expiración
    if (usuario.resetToken !== code) {
      console.log('Código no coincide:', {
        codigoRecibido: code,
        codigoGuardado: usuario.resetToken
      });
      return res.status(400).json({
        message: 'Código inválido o expirado'
      });
    }

    if (!usuario.resetTokenExpires || usuario.resetTokenExpires < Date.now()) {
      console.log('Código expirado:', {
        expiracion: usuario.resetTokenExpires,
        ahora: new Date()
      });
      return res.status(400).json({
        message: 'Código inválido o expirado'
      });
    }

    // Si el código es válido, devolver éxito
    res.status(200).json({
      message: 'Código verificado correctamente'
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({
      message: 'Error al verificar el código'
    });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos' });
    }

    // Buscar usuario por token
    const usuario = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });

    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    // Actualizar solo la contraseña usando findOneAndUpdate
    await User.findOneAndUpdate(
      { _id: usuario._id },
      {
        $set: {
          password: password,
          resetToken: null,
          resetTokenExpires: null
        }
      },
      { 
        new: true,
        runValidators: false // Desactivar validadores para esta operación
      }
    );

    console.log('Contraseña actualizada para usuario:', usuario.email);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};