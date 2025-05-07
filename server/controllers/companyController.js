const Company = require('../models/Company');
const Brand = require('../models/Brand');
const Product = require('../models/Product');

// Crear una nueva compañía
exports.createCompany = async (req, res) => {
  try {
    // Se obtienen los datos del body y se incluyen las URLs ya obtenidas
    const { nombre, email, plan, productos, imagenBanner, imagenPerfil } = req.body;

    const company = new Company({
      nombre,
      email,
      plan: plan || 'Mensual',
      imagenBanner: imagenBanner || '',  // URL proveniente de Firebase
      imagenPerfil: imagenPerfil || '',  // URL proveniente de Firebase
      productos: productos || []
    });

    const savedCompany = await company.save();
    res.status(201).json(savedCompany);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const updatedCompany = await Company.findByIdAndUpdate(
      req.params.id,
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
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany)
      return res.status(404).json({ message: 'Compañía no encontrada' });
    res.json({ message: 'Compañía eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
