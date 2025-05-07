const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, authorizeRole, checkCompanyOwnership } = require('../middlewares/auth');

// Rutas básicas para usuarios

// Solo Administrador puede crear nuevos usuarios
router.post('/', verifyToken, authorizeRole('Administrador'), userController.createUser);

// Solo Administrador y Gerente pueden obtener la lista completa de usuarios
router.get('/', verifyToken, authorizeRole('Administrador'), userController.getUsers);

// Para obtener un usuario por ID, se requiere autenticación.
// Aquí podrías agregar condiciones adicionales según la lógica de negocio (por ejemplo,
// que un usuario solo pueda ver sus propios datos, o que Administrador y Gerente puedan ver cualquier usuario)
router.get('/:id', verifyToken, userController.getUserById);

// Para actualizar un usuario, se verifica el token y se comprueba la propiedad (o coincidencia de usuario)
// mediante checkCompanyOwnership. Esto permite que un Gerente solo actúe sobre usuarios de su compañía,
// o que un usuario solo modifique sus propios datos.
router.put('/:id', verifyToken, checkCompanyOwnership, userController.updateUser);

// De igual forma, para eliminar un usuario se requiere token y la comprobación de propiedad.
router.delete('/:id', verifyToken, checkCompanyOwnership, userController.deleteUser);

module.exports = router;
