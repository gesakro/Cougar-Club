const express = require('express');
const path = require('path');
const app = express();

// Servir los archivos estáticos de la carpeta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Para cualquier ruta no encontrada, servir index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Escucha el puerto proporcionado por Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
