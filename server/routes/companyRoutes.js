// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const uploadController = require('../controllers/uploadController');
const { verifyToken, authorizeRole } = require('../middlewares/auth');

// Ruta separada para subir solo imágenes
router.post(
  '/upload-images',
  verifyToken,
  uploadController.uploadImagesMiddleware,
  uploadController.uploadCompanyImages
);

// Ruta para crear una compañía (solo admin)
router.post(
  '/',
  verifyToken,
  authorizeRole('Administrador'),
  companyController.createCompany
);

// Ruta para crear compañía por gerente autenticado
router.post(
  '/manager',
  verifyToken,
  authorizeRole('Gerente'),
  companyController.createManagerCompany
);

// Obtener todas las compañías (sin restricciones)
router.get('/', companyController.getCompanies);

// Obtener compañía del gerente autenticado
router.get(
  '/manager/company',
  verifyToken,
  authorizeRole('Gerente'),
  companyController.getManagerCompany
);

// Obtener compañía por ID (sin restricciones)
router.get('/:id', companyController.getCompanyById);

// Actualizar compañía: Administrador o Gerente (el Gerente solo puede actualizar su propia compañía)
router.put(
  '/:id',
  verifyToken,
  authorizeRole('Administrador', 'Gerente'),
  companyController.updateCompany
);

// Eliminar compañía: solo Administrador
router.delete(
  '/:id',
  verifyToken,
  authorizeRole('Administrador'),
  companyController.deleteCompany
);

// Obtener detalle de la compañía con marcas y productos asociados
router.get('/:id/detail', companyController.getCompanyDetail);

module.exports = router;