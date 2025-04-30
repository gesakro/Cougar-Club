const Brand = require('../models/Brand');

// Crear una nueva marca
exports.createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    const savedBrand = await brand.save();
    res.status(201).json(savedBrand);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las marcas
exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate('compania');
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
    const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
    if (!deletedBrand)
      return res.status(404).json({ message: 'Marca no encontrada' });
    res.json({ message: 'Marca eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
