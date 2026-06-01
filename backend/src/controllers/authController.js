// src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const getAccessTokenSecret = () => process.env.JWT_SECRET || 'dev_secret_change_me';
const getRefreshTokenSecret = () => process.env.JWT_REFRESH_SECRET || getAccessTokenSecret();
const getAccessTokenExpiry = () => process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const getRefreshTokenExpiry = () => process.env.JWT_REFRESH_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '30d';
const MAX_REFRESH_SESSIONS = Number(process.env.JWT_MAX_REFRESH_SESSIONS || 20);

const hashRefreshToken = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');

const pruneRefreshSessions = (sessions = []) => {
  const now = Date.now();
  return (Array.isArray(sessions) ? sessions : []).filter((entry) => {
    if (!entry?.expiresAt) return false;
    return new Date(entry.expiresAt).getTime() > now;
  });
};

const issueTokenPair = async (user, options = {}) => {
  const userId = user._id.toString();
  const sessionId = crypto.randomUUID();

  const accessToken = jwt.sign(
    { sub: userId, id: userId, email: user.email, role: user.role, type: 'access' },
    getAccessTokenSecret(),
    { expiresIn: getAccessTokenExpiry() }
  );

  const refreshToken = jwt.sign(
    { sub: userId, sid: sessionId, type: 'refresh' },
    getRefreshTokenSecret(),
    { expiresIn: getRefreshTokenExpiry() }
  );

  const decodedRefresh = jwt.decode(refreshToken);
  const refreshExpiry = decodedRefresh?.exp ? new Date(decodedRefresh.exp * 1000) : new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
  const refreshHash = hashRefreshToken(refreshToken);

  const activeSessions = pruneRefreshSessions(user.refreshTokens || []);

  if (options.rotateFromHash) {
    const previousSession = activeSessions.find((entry) => entry.tokenHash === options.rotateFromHash && !entry.revokedAt);
    if (previousSession) {
      previousSession.revokedAt = new Date();
      previousSession.replacedByHash = refreshHash;
    }
  }

  activeSessions.push({
    tokenHash: refreshHash,
    sessionId,
    createdAt: new Date(),
    expiresAt: refreshExpiry,
    revokedAt: null,
    replacedByHash: null
  });

  activeSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  user.refreshTokens = activeSessions.slice(0, Math.max(1, MAX_REFRESH_SESSIONS));
  await user.save();

  return { accessToken, refreshToken };
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  savedShippingAddress: user.savedShippingAddress
});

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();

export const registerUser = async (req, res) => {
  try {
    const { name, nombre, email, password } = req.body;
    const userName = name || nombre;

    const normalizedEmail = normalizeEmail(email);
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return sendError(res, { status: 409, message: 'El usuario ya existe' });
    }

    const user = await User.create({
      name: userName,
      email: normalizedEmail,
      password,
      role: 'user'
    });

    if (!user) {
      return sendError(res, { status: 400, message: 'Datos de usuario inválidos' });
    }

    const { accessToken, refreshToken } = await issueTokenPair(user);

    return sendSuccess(res, {
      status: 201,
      message: 'Usuario registrado correctamente',
      token: accessToken,
      accessToken,
      refreshToken,
      user: sanitizeUser(user)
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
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
              return sendError(res, { status: 403, message: 'Usuario bloqueado. Contacta a un administrador.' });
            }

            const { accessToken, refreshToken } = await issueTokenPair(user);

            return sendSuccess(res, {
              status: 200,
              message: 'Sesion iniciada correctamente',
              token: accessToken,
              accessToken,
              refreshToken,
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

export const refreshSession = async (req, res) => {
  try {
    const incomingRefreshToken = req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!incomingRefreshToken) {
      return sendError(res, { status: 401, message: 'Refresh token requerido' });
    }

    let payload;
    try {
      payload = jwt.verify(incomingRefreshToken, getRefreshTokenSecret());
    } catch (error) {
      return sendError(res, { status: 401, message: 'Refresh token inválido o expirado' });
    }

    if (payload?.type !== 'refresh') {
      return sendError(res, { status: 401, message: 'Tipo de token no válido para refresh' });
    }

    const userId = payload.sub || payload.id;
    const tokenHash = hashRefreshToken(incomingRefreshToken);
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, { status: 401, message: 'Usuario no válido para refresh' });
    }

    const sessions = pruneRefreshSessions(user.refreshTokens || []);
    const currentSession = sessions.find((entry) => (
      entry.tokenHash === tokenHash &&
      !entry.revokedAt &&
      String(entry.sessionId || '') === String(payload.sid || '')
    ));

    if (!currentSession) {
      user.refreshTokens = sessions;
      await user.save();
      return sendError(res, { status: 401, message: 'Refresh token revocado o desconocido' });
    }

    if (user.isBlocked) {
      currentSession.revokedAt = new Date();
      user.refreshTokens = sessions;
      await user.save();
      return sendError(res, { status: 403, message: 'Usuario bloqueado' });
    }

    user.refreshTokens = sessions;
    const { accessToken, refreshToken } = await issueTokenPair(user, { rotateFromHash: tokenHash });

    return sendSuccess(res, {
      message: 'Sesion renovada correctamente',
      token: accessToken,
      accessToken,
      refreshToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    logger.error('Error renovando sesión', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al renovar sesión', error: error.message });
  }
};

export const logoutSession = async (req, res) => {
  try {
    const refreshToken = req.body?.refreshToken;
    const user = await User.findById(req.user?.sub);
    if (!user) {
      return sendSuccess(res, { message: 'Sesion cerrada' });
    }

    if (!refreshToken) {
      user.refreshTokens = [];
      await user.save();
      return sendSuccess(res, { message: 'Sesion cerrada en todos los dispositivos' });
    }

    const refreshHash = hashRefreshToken(refreshToken);
    const sessions = pruneRefreshSessions(user.refreshTokens || []);
    const target = sessions.find((entry) => entry.tokenHash === refreshHash && !entry.revokedAt);
    if (target) {
      target.revokedAt = new Date();
    }

    user.refreshTokens = sessions;
    await user.save();

    return sendSuccess(res, { message: 'Sesion cerrada correctamente' });
  } catch (error) {
    logger.error('Error cerrando sesión', { message: error.message });
    return sendError(res, { status: 500, message: 'Error al cerrar sesión', error: error.message });
  }
};