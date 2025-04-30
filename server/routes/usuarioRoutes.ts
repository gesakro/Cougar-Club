import { Router } from 'express';
import {
    obtenerUsuarios,
    crearUsuario,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario,
} from '../controllers/usuarioController';


const router = Router();

router.get('/', obtenerUsuarios);
router.post('/', crearUsuario);
router
    .route('/:id')
    .get(obtenerUsuarioPorId)
    .put(actualizarUsuario)
    .delete(eliminarUsuario);

export default router;
