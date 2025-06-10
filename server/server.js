// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Conectar a MongoDB Atlas
connectDB();

// Definir los orígenes permitidos
const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080'];

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir solicitudes sin origen (por ejemplo, herramientas como Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error(`El origen ${origin} no está permitido por CORS`), false);
      }
      return callback(null, true);
    }
  })
);

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

// Rutas principales
app.get('/', (req, res) => {
  res.send('Backend Express funcionando');
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

// Middleware global de gestión de errores (opcional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
