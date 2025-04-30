import { Request, Response } from 'express';

// Obtener todos los usuarios
export const obtenerUsuarios = (_req: Request, res: Response): void => {
    res.send('Aquí se obtienen todos los usuarios.');
};

// Crear un nuevo usuario
export const crearUsuario = (req: Request, res: Response): void => {
    const { nombre, email } = req.body;
    res.send(`Usuario creado: ${nombre}, ${email}`);
};

// Obtener un usuario por ID
export const obtenerUsuarioPorId = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.send(`Usuario con ID: ${id}`);
};

// Actualizar un usuario
export const actualizarUsuario = (req: Request, res: Response): void => {
    const { id } = req.params;
    const { nombre, email } = req.body;
    res.send(`Usuario actualizado: ${id}, ${nombre}, ${email}`);
};

// Eliminar un usuario
export const eliminarUsuario = (req: Request, res: Response): void => {
    const { id } = req.params;
    res.send(`Usuario con ID: ${id} eliminado.`);
};
