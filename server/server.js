// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Conectar a MongoDB Atlas
connectDB();

// Definir los orígenes permitidos
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://cougar-club-cojsco-dm1f.vercel.app'  // Sin la barra al final
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS mejorada
app.use(
  cors({
    origin: function (origin, callback) {
      console.log('CORS Origin:', origin); // Para debugging
      
      // Permitir solicitudes sin origen (por ejemplo, herramientas como Postman)
      if (!origin) {
        console.log('Permitiendo solicitud sin origen');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('Origen permitido:', origin);
        return callback(null, true);
      } else {
        console.log('Origen no permitido:', origin);
        return callback(new Error(`El origen ${origin} no está permitido por CORS`), false);
      }
    },
    credentials: true, // Permitir cookies y headers de autorización
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Para compatibilidad con algunos navegadores
  })
);

// Servir archivos estáticos desde el directorio uploads
app.use('/uploads', express.static('uploads'));

// Importar rutas
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const companyRoutes = require('./routes/companyRoutes');
const brandRoutes = require('./routes/brandRoutes');
const cartRoutes = require('./routes/cartRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const purchaseDetailRoutes = require('./routes/purchaseDetailRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Rutas principales
app.get('/', (req, res) => {
  res.send('Backend Express funcionando');
});

// Ruta de prueba para verificar CORS
app.get('/api/test', (req, res) => {
  console.log('Test endpoint llamado desde:', req.headers.origin);
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    cors: 'Configurado correctamente'
  });
});

// Rutas de prueba para productos y marcas
app.get('/api/test/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({}).limit(5);
    res.json({ 
      message: 'Test productos',
      count: products.length,
      products: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/brands', async (req, res) => {
  try {
    const Brand = require('./models/Brand');
    const brands = await Brand.find({}).limit(5);
    res.json({ 
      message: 'Test marcas',
      count: brands.length,
      brands: brands
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/test/purchases', async (req, res) => {
  try {
    const Purchase = require('./models/Purchase');
    const purchases = await Purchase.find({}).limit(5);
    res.json({ 
      message: 'Test compras',
      count: purchases.length,
      purchases: purchases
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/purchase-details', purchaseDetailRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

// Middleware global de gestión de errores (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
