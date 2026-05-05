// src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

// Función auxiliar para generar el token (no necesita export si solo se usa aquí)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  savedShippingAddress: user.savedShippingAddress
});

export const registerUser = async (req, res) => {
  try {
    const { name, nombre, email, password, role, adminRegistrationKey } = req.body;
    const userName = name || nombre;

    const requestedRole = role === 'admin' ? 'admin' : 'user';
    let canCreateAdmin = false;

    if (requestedRole === 'admin') {
      const configuredAdminKey = String(process.env.ADMIN_REGISTRATION_KEY || '').trim();

      if (configuredAdminKey) {
        canCreateAdmin = adminRegistrationKey === configuredAdminKey;
      } else {
        // Modo temporal: sin clave configurada, solo permitir bootstrap del primer admin.
        const adminCount = await User.countDocuments({ role: 'admin' });
        canCreateAdmin = adminCount === 0;
      }
    }

    if (requestedRole === 'admin' && !canCreateAdmin) {
      return sendError(res, {
        status: 403,
        message: 'No autorizado para registrar cuentas de administrador. Si no hay clave configurada, solo se permite un primer admin temporal.'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, { status: 409, message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name: userName,
      email,
      password,
      role: canCreateAdmin ? 'admin' : 'user'
    });

    if (!user) {
      return sendError(res, { status: 400, message: 'Datos de usuario inválidos' });
    }

    return sendSuccess(res, {
      status: 201,
      message: 'Usuario registrado correctamente',
      token: generateToken(user._id),
      user: sanitizeUser(user),
      bootstrapAdmin: requestedRole === 'admin' && canCreateAdmin && !String(process.env.ADMIN_REGISTRATION_KEY || '').trim()
    });
  } catch (error) {
    logger.error('Error en registro de usuario', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Autenticar usuario y obtener token
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
              return sendError(res, { status: 403, message: 'Usuario bloqueado. Contacta a un administrador.' });
            }

            return sendSuccess(res, {
              status: 200,
              message: 'Sesion iniciada correctamente',
              token: generateToken(user._id),
              user: sanitizeUser(user)
            });
        } else {
            return sendError(res, { status: 401, message: 'Email o contraseña incorrectos' });
        }
    } catch (error) {
        logger.error('Error en login', { message: error.message });
        return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
    }
};

// @desc    Obtener perfil del usuario
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.sub).select('-password');
    if (!user) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    return sendSuccess(res, {
      message: 'Perfil de usuario obtenido',
      data: sanitizeUser(user)
    });
  } catch (error) {
    logger.error('Error obteniendo perfil', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Actualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.sub);
    if (!user) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    const { name, currentPassword, newPassword } = req.body;

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      const isCurrentValid = await user.matchPassword(currentPassword || '');
      if (!isCurrentValid) {
        return sendError(res, { status: 401, message: 'La contraseña actual es incorrecta' });
      }
      user.password = newPassword;
    }

    await user.save();

    return sendSuccess(res, {
      message: 'Perfil actualizado',
      data: sanitizeUser(user)
    });
  } catch (error) {
    logger.error('Error actualizando perfil', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

export const getSavedShippingAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user?.sub).select('savedShippingAddress');
    if (!user) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    return sendSuccess(res, {
      message: 'Direccion guardada obtenida',
      data: user.savedShippingAddress || null
    });
  } catch (error) {
    logger.error('Error obteniendo direccion guardada', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

export const updateSavedShippingAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user?.sub);
    if (!user) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    user.savedShippingAddress = {
      ...user.savedShippingAddress,
      ...req.body,
      country: req.body?.country || user.savedShippingAddress?.country || 'México'
    };

    await user.save();

    return sendSuccess(res, {
      message: 'Direccion guardada actualizada',
      data: user.savedShippingAddress
    });
  } catch (error) {
    logger.error('Error actualizando direccion guardada', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Solicitar restablecimiento de contraseña
export const requestPasswordReset = async (req, res) => {
  return sendSuccess(res, { message: 'Solicitud de reset enviada' });
};

// @desc    Listar todos los usuarios (Admin)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, {
      message: 'Lista de usuarios obtenida',
      data: users
    });
  } catch (error) {
    logger.error('Error listando usuarios', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al obtener usuarios', error: error.message });
  }
};

// @desc    Actualizar rol de usuario (Admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return sendError(res, { status: 400, message: `Rol invalido. Roles validos: ${validRoles.join(', ')}` });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    if (req.user?.sub === userToUpdate._id.toString() && role !== 'admin') {
      return sendError(res, { status: 409, message: 'No puedes quitarte tu propio rol de administrador' });
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    return sendSuccess(res, {
      message: 'Rol actualizado correctamente',
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        isBlocked: userToUpdate.isBlocked,
        createdAt: userToUpdate.createdAt,
        updatedAt: userToUpdate.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error actualizando rol de usuario', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al actualizar rol', error: error.message });
  }
};

// @desc    Actualizar estado de bloqueo de usuario (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
      return sendError(res, { status: 400, message: 'isBlocked debe ser booleano' });
    }

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    if (req.user?.sub === userToUpdate._id.toString() && isBlocked) {
      return sendError(res, { status: 409, message: 'No puedes bloquear tu propia cuenta' });
    }

    userToUpdate.isBlocked = isBlocked;
    await userToUpdate.save();

    return sendSuccess(res, {
      message: isBlocked ? 'Usuario bloqueado correctamente' : 'Usuario desbloqueado correctamente',
      data: {
        _id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
        isBlocked: userToUpdate.isBlocked,
        createdAt: userToUpdate.createdAt,
        updatedAt: userToUpdate.updatedAt
      }
    });
  } catch (error) {
    logger.error('Error actualizando estado de usuario', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al actualizar estado de usuario', error: error.message });
  }
};

// @desc    Eliminar usuario (Admin)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return sendError(res, { status: 404, message: 'Usuario no encontrado' });
    }

    if (req.user?.sub === userToDelete._id.toString()) {
      return sendError(res, { status: 409, message: 'No puedes eliminar tu propia cuenta' });
    }

    await User.findByIdAndDelete(id);

    return sendSuccess(res, { message: 'Usuario eliminado correctamente' });
  } catch (error) {
    logger.error('Error eliminando usuario', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al eliminar usuario', error: error.message });
  }
};