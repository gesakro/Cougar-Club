// controllers/uploadController.js
const multer = require('multer');
const { bucket } = require('../config/firebaseAdmin');

// Configuración de multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
});

// Middleware para manejar errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El archivo excede el tamaño permitido (10MB)' });
    }
    return res.status(400).json({ message: `Error al subir archivo: ${err.message}` });
  } else if (err) {
    return res.status(500).json({ message: `Error del servidor: ${err.message}` });
  }
  next();
};

// Middleware para subir archivos
exports.uploadImagesMiddleware = [
  upload.fields([
    { name: "imagenBanner", maxCount: 1 },
    { name: "imagenPerfil", maxCount: 1 }
  ]),
  handleMulterError
];

// Función auxiliar para subir un archivo a Firebase Storage
const uploadFileToFirebase = async (file, prefix) => {
  const fileName = `companies/${Date.now()}_${prefix}_${file.originalname.replace(/\s+/g, '_')}`;
  const fileUpload = bucket.file(fileName);
  
  return new Promise((resolve, reject) => {
    const blobStream = fileUpload.createWriteStream({
      metadata: { contentType: file.mimetype },
      resumable: false
    });
    
    blobStream.on('error', (error) => {
      console.error(`Error al subir imagen ${prefix}:`, error);
      reject(error);
    });
    
    blobStream.on('finish', async () => {
      try {
        await fileUpload.makePublic();
        const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(url);
      } catch (error) {
        console.error(`Error al hacer público el archivo ${prefix}:`, error);
        reject(error);
      }
    });
    
    blobStream.end(file.buffer);
  });
};

// Controlador para subir imágenes a Firebase Storage
exports.uploadCompanyImages = async (req, res) => {
  try {
    let imagenBannerUrl = "";
    let imagenPerfilUrl = "";
    
    // Procesar imagen de banner si existe
    if (req.files && req.files.imagenBanner && req.files.imagenBanner.length > 0) {
      try {
        imagenBannerUrl = await uploadFileToFirebase(req.files.imagenBanner[0], 'banner');
      } catch (error) {
        console.error("Error al subir imagen de banner:", error);
        return res.status(500).json({ message: "Error al subir imagen de banner a Firebase Storage" });
      }
    }
    
    // Procesar imagen de perfil si existe
    if (req.files && req.files.imagenPerfil && req.files.imagenPerfil.length > 0) {
      try {
        imagenPerfilUrl = await uploadFileToFirebase(req.files.imagenPerfil[0], 'perfil');
      } catch (error) {
        console.error("Error al subir imagen de perfil:", error);
        return res.status(500).json({ message: "Error al subir imagen de perfil a Firebase Storage" });
      }
    }
    
    // Devolver las URLs de las imágenes subidas
    return res.status(200).json({ imagenBannerUrl, imagenPerfilUrl });
    
  } catch (error) {
    console.error("Error general al subir imágenes:", error);
    return res.status(500).json({ message: error.message || "Error desconocido al subir imágenes" });
  }
};

exports.uploadProductImageMiddleware = [
  upload.single("imagen"),
  handleMulterError
];

// Controlador para subir la imagen de un producto a Firebase Storage

exports.uploadProductImage = async (req, res) => {
    try {
      let imagenUrl = "";
      
      if (req.file) {
        const file = req.file;
        const fileName = `products/${Date.now()}_producto_${file.originalname.replace(/\s+/g, '_')}`;
        const fileUpload = bucket.file(fileName);
  
        // Crear una promesa para manejar la subida
        try {
          const blobStream = fileUpload.createWriteStream({
            metadata: { contentType: file.mimetype },
            resumable: false
          });
          
          await new Promise((resolve, reject) => {
            blobStream.on('error', (error) => {
              console.error("Error al subir imagen de producto:", error);
              reject(error);
            });
            
            blobStream.on('finish', async () => {
              try {
                // Hacer que el archivo sea públicamente accesible
                await fileUpload.makePublic();
                imagenUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
                resolve();
              } catch (error) {
                console.error("Error al hacer público el archivo:", error);
                reject(error);
              }
            });
            
            blobStream.end(file.buffer);
          });
          
          return res.status(200).json({ imagenUrl });
        } catch (error) {
          console.error("Error durante la subida del archivo:", error);
          return res.status(500).json({ message: "Error al subir archivo a Firebase Storage" });
        }
      } else {
        return res.status(200).json({ imagenUrl });
      }
    } catch (error) {
      console.error("Error general al subir imagen de producto:", error);
      return res.status(500).json({ message: error.message || "Error desconocido al subir imagen de producto" });
    }
  };