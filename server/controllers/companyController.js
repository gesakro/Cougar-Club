const Company = require('../models/Company');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Crear una nueva compañía
exports.createCompany = async (req, res) => {
  try {
    const { nombre, email, plan, password } = req.body;

    // Verificar si ya existe una compañía con ese email
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Ya existe una compañía registrada con este email' });
    }

    // Crear la compañía
    const company = new Company({
      nombre,
      email,
      plan: plan || 'Mensual',
      imagenBanner: '',
      imagenPerfil: '',
      productos: []
    });

    const savedCompany = await company.save();

    // Crear el usuario gerente
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      rol: 'Gerente',
      compania_id: savedCompany._id,
      perfil: {
        nombre: nombre,
        apellido: '',
        telefono: '',
        direccion: ''
      }
    });

    await user.save();

    // Generar token JWT
    const payload = {
      user: {
        id: user._id,
        rol: user.rol,
        compania_id: savedCompany._id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      _id: savedCompany._id,
      nombre: savedCompany.nombre,
      email: savedCompany.email,
      plan: savedCompany.plan
    });
  } catch (error) {
    console.error('Error al crear compañía:', error);
    res.status(500).json({ message: 'Error al crear la compañía', error: error.message });
  }
};

// Crear compañía por gerente autenticado
exports.createManagerCompany = async (req, res) => {
  try {
    const { nombre, email, plan } = req.body;
    const userId = req.user.id;

    // Verificar si ya existe una compañía con ese email
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Ya existe una compañía registrada con este email' });
    }

    // Crear la compañía
    const company = new Company({
      nombre,
      email,
      plan: plan || 'Mensual',
      imagenBanner: '',
      imagenPerfil: '',
      productos: []
    });

    const savedCompany = await company.save();

    // Actualizar el usuario con el ID de la compañía
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { compania_id: savedCompany._id },
      { new: true }
    );

    if (!updatedUser) {
      // Si no se pudo actualizar el usuario, eliminar la compañía creada
      await Company.findByIdAndDelete(savedCompany._id);
      return res.status(500).json({ message: 'Error al actualizar el usuario' });
    }

    // Generar nuevo token con la información actualizada
    const payload = {
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        rol: updatedUser.rol,
        compania_id: savedCompany._id
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      company: {
        _id: savedCompany._id,
        nombre: savedCompany.nombre,
        email: savedCompany.email,
        plan: savedCompany.plan
      }
    });
  } catch (error) {
    console.error('Error al crear compañía:', error);
    res.status(500).json({ message: 'Error al crear la compañía', error: error.message });
  }
};

// Obtener compañía del gerente autenticado (NUEVO)
exports.getManagerCompany = async (req, res) => {
  try {
    const userId = req.user.id;  // Obtenido del middleware de autenticación

    // Buscar el usuario para obtener su compania_id
    const user = await User.findById(userId);
    if (!user || user.rol !== 'Gerente') {
      return res.status(403).json({ message: 'Solo los gerentes pueden acceder a esta función' });
    }

    // Si el gerente no tiene compañía asignada, devolver 404
    if (!user.compania_id) {
      return res.status(404).json({ 
        message: 'El gerente no tiene compañía asignada',
        hasCompany: false
      });
    }

    // Buscar la compañía
    const company = await Company.findById(user.compania_id);
    if (!company) {
      return res.status(404).json({ 
        message: 'Compañía no encontrada',
        hasCompany: false
      });
    }

    res.json({
      ...company.toObject(),
      hasCompany: true
    });
  } catch (error) {
    console.error('Error al obtener compañía del gerente:', error);
    res.status(500).json({ message: 'Error al obtener la compañía', error: error.message });
  }
};

// Obtener todas las compañías
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una compañía por ID
exports.getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company)
      return res.status(404).json({ message: 'Compañía no encontrada' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener compañía con sus marcas y productos asociados
exports.getCompanyDetail = async (req, res) => {
  try {
    const companyId = req.params.id;
    // Se consulta la compañía
    const company = await Company.findById(companyId);
    if (!company)
      return res.status(404).json({ message: 'Compañía no encontrada' });

    // Se obtienen las marcas asociadas a la compañía
    const brands = await Brand.find({ compania: companyId });

    // Para cada marca, se buscan los productos que pertenecen a ella
    const brandsWithProducts = await Promise.all(
      brands.map(async brand => {
        const products = await Product.find({ marca_id: brand._id });
        return { brand, products };
      })
    );

    res.json({ company, brands: brandsWithProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una compañía por ID
exports.updateCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.user?.id;

    // Si hay un usuario autenticado, verificar permisos
    if (userId) {
      const user = await User.findById(userId);
      
      // Si es gerente, solo puede actualizar su propia compañía
      if (user && user.rol === 'Gerente' && user.compania_id.toString() !== companyId) {
        return res.status(403).json({ message: 'No tienes permisos para actualizar esta compañía' });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      req.body,
      { new: true }
    );
    
    if (!updatedCompany)
      return res.status(404).json({ message: 'Compañía no encontrada' });
    
    res.json(updatedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una compañía por ID
exports.deleteCompany = async (req, res) => {
  try {
    const companyId = req.params.id;
    const userId = req.user?.id;

    // Si hay un usuario autenticado, verificar permisos
    if (userId) {
      const user = await User.findById(userId);
      
      // Solo administradores pueden eliminar compañías
      if (user && user.rol !== 'Administrador') {
        return res.status(403).json({ message: 'Solo los administradores pueden eliminar compañías' });
      }
    }

    const deletedCompany = await Company.findByIdAndDelete(companyId);
    if (!deletedCompany)
      return res.status(404).json({ message: 'Compañía no encontrada' });
    
    // También eliminar la referencia en los usuarios
    await User.updateMany(
      { compania_id: companyId },
      { $unset: { compania_id: 1 } }
    );

    res.json({ message: 'Compañía eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};