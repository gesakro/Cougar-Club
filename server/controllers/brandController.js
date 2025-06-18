const Brand = require('../models/Brand');
const Product = require('../models/Product'); // Import Product model to check for dependencies

// Crear una nueva marca
exports.createBrand = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    // Validar campos requeridos
    if (!req.body.nombre || !req.body.compania) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: nombre o compania' 
      });
    }

    // Crear la marca
    const brand = new Brand({
      nombre: req.body.nombre,
      compania: req.body.compania
    });

    console.log('Marca a crear:', brand);

    const savedBrand = await brand.save();
    console.log('Marca creada:', savedBrand);
    
    res.status(201).json(savedBrand);
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).json({ 
      message: 'Error al crear la marca',
      error: error.message 
    });
  }
};

// Obtener todas las marcas con filtro por compañía
exports.getBrands = async (req, res) => {
  try {
    const { compania } = req.query;
    
    // Filtrar por compañía si se proporciona el parámetro
    const filter = {};
    if (compania) {
      filter.compania = compania;
    }
    
    const brands = await Brand.find(filter).populate('compania');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una marca por ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una marca
exports.updateBrand = async (req, res) => {
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedBrand)
      return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar una marca
exports.deleteBrand = async (req, res) => {
  try {
    const brandId = req.params.id;
    
    // Check if there are products using this brand
    const productsWithBrand = await Product.find({ marca_id: brandId });
    
    if (productsWithBrand.length > 0) {
      // Option 1: Prevent deletion if products reference this brand
      return res.status(400).json({ 
        message: 'No se puede eliminar la marca porque hay productos asociados a ella. Actualice o elimine estos productos primero.',
        productsCount: productsWithBrand.length 
      });
      
      // Option 2 (Alternative): Update products to remove brand reference
      // Uncomment this if you want to allow brand deletion and automatically remove references
      /*
      await Product.updateMany(
        { marca_id: brandId },
        { $set: { marca_id: null } }
      );
      */
    }
    
    // Now it's safe to delete the brand
    const deletedBrand = await Brand.findByIdAndDelete(brandId);
    if (!deletedBrand) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }
    
    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener marcas por compañía
exports.getBrandsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const brands = await Brand.find({ compania: companyId });
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};