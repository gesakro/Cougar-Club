// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const uploadController = require('../controllers/uploadController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Ruta separada para subir solo imágenes
router.post(
  '/upload-images',
  uploadController.uploadImagesMiddleware,
  uploadController.uploadCompanyImages
);

// Ruta para crear una compañía
router.post(
  '/',
  verifyToken,
  authorizeRole('Administrador'),
  companyController.createCompany
);

// Obtener todas las compañías (sin restricciones)
router.get('/', companyController.getCompanies);

// Obtener compañía por ID (sin restricciones)
router.get('/:id', companyController.getCompanyById);

// Actualizar compañía: Administrador o Gerente (el Gerente solo puede actualizar su propia compañía)
router.put(
  '/:id',
  verifyToken,
  authorizeRole('Administrador', 'Gerente'),
  async (req, res, next) => {
    if (req.user.rol === 'Gerente' && req.user.compania_id.toString() !== req.params.id) {
      return res.status(403).json({ msg: 'Acceso prohibido: no puedes modificar esta compañía' });
    }
    next();
  },
  companyController.updateCompany
);

// Eliminar compañía: solo Administrador
router.delete('/:id', verifyToken, authorizeRole('Administrador'), companyController.deleteCompany);

// Obtener detalle de la compañía con marcas y productos asociados
router.get('/:id/detail', companyController.getCompanyDetail);

module.exports = router;