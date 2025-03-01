const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(morgan('dev'));

// Rutas
app.get('/', (req, res) => {
  res.send('¡Hola, Mundo!');
});

// Puesta en marcha del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
