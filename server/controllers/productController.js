const Product = require('../models/Product');
const Brand = require('../models/Brand');

// Crear un producto
exports.createProduct = async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    // Validar campos requeridos
    if (!req.body.nombre || !req.body.precio || !req.body.compania_id) {
      return res.status(400).json({ 
        message: 'Faltan campos requeridos: nombre, precio o compania_id' 
      });
    }

    // Crear el producto
    const product = new Product({
      compania_id: req.body.compania_id,
      marca_id: req.body.marca_id || null,
      descripcion: req.body.descripcion || '',
      nombre: req.body.nombre,
      precio: parseFloat(req.body.precio),
      imagen: req.body.imagen || '',
      categoria: req.body.categoria || '',
      stock: parseInt(req.body.stock) || 0
    });

    console.log('Producto a crear:', product);

    const savedProduct = await product.save();
    console.log('Producto creado:', savedProduct);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      message: 'Error al crear el producto',
      error: error.message 
    });
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

// Verificar stock disponible
exports.checkStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Stock insuficiente',
        availableStock: product.stock
      });
    }

    res.json({ 
      message: 'Stock disponible',
      availableStock: product.stock
    });
  } catch (error) {
    console.error('Error al verificar stock:', error);
    res.status(500).json({ message: 'Error al verificar stock' });
  }
};

// Actualizar stock después de una compra
exports.updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: 'Stock insuficiente',
        availableStock: product.stock
      });
    }

    product.stock -= quantity;
    await product.save();

    res.json({ 
      message: 'Stock actualizado correctamente',
      newStock: product.stock
    });
  } catch (error) {
    console.error('Error al actualizar stock:', error);
    res.status(500).json({ message: 'Error al actualizar stock' });
  }
};