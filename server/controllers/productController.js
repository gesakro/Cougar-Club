const Product = require('../models/Product');

// Crear un producto
exports.createProduct = async (req, res) => {
  try {
    const product = new Product({
      compania_id: req.body.compania_id,
      marca_id: req.body.marca_id,
      descripcion: req.body.descripcion,
      nombre: req.body.nombre,
      precio: req.body.precio,
      imagen: req.body.imagen,
      categoria: req.body.categoria,
      stock: req.body.stock
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los productos (con filtrado por compañía)
exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, compania_id } = req.query;
    
    // Construir filtro basado en los parámetros de consulta
    const filter = {};
    if (compania_id) {
      filter.compania_id = compania_id;
    }
    
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener producto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar producto por ID
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar producto por ID
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener productos por marca
exports.getProductsByBrand = async (req, res) => {
  try {
    const { marca_id } = req.params;
    
    const products = await Product.find({ marca_id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};