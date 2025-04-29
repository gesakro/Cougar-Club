// server.js
require('dotenv').config(); // Carga tus variables de entorno
const cors = require('cors'); // Importa el paquete cors
const express = require('express');
const connectDB = require('./config/db');


const app = express();

// Configura Cors para permitir solicitudes desde http://localhost:3000
app.use(cors({
    origin: "http://localhost:3000",
  }));

// Conecta a MongoDB Atlas
connectDB();

// Middleware para parsear JSON
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Backend Express funcionando');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
