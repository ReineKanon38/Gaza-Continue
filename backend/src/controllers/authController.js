// src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { sendWelcomeEmail, sendPasswordResetEmail, sendEmail } from '../services/emailService.js';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';

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
  savedShippingAddress: user.savedShippingAddress,
  twoFactorEnabled: user.twoFactorEnabled
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

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(e => logger.error('Error enviando correo de bienvenida', { error: e.message }));

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
        const { email, password, twoFactorToken } = req.body;
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });

        if (user && (await user.matchPassword(password))) {
            if (user.isBlocked) {
              return sendError(res, { status: 403, message: 'Usuario bloqueado. Contacta a un administrador.' });
            }

            if (user.twoFactorEnabled) {
              if (!twoFactorToken) {
                return sendSuccess(res, { status: 202, message: 'A2F Requerido', requires2fa: true });
              }
              const isValid = authenticator.verify({ token: twoFactorToken, secret: user.twoFactorSecret });
              if (!isValid) {
                return sendError(res, { status: 401, message: 'Código A2F inválido' });
              }
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
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Evitar que atacantes descubran si el correo existe
      return sendSuccess(res, { message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetUrl = `${req.headers.origin || 'http://localhost:5173'}/reset/${resetToken}`;
    const emailSent = await sendPasswordResetEmail(user.email, resetUrl);

    if (process.env.NODE_ENV !== 'production') {
      return sendSuccess(res, { 
        message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.',
        data: { resetUrl, emailSent }
      });
    }

    return sendSuccess(res, { message: 'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
  } catch (error) {
    logger.error('Error en password reset', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Restablecer contraseña usando token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, password } = req.body;
    const targetPassword = newPassword || password;

    if (!targetPassword) {
      return sendError(res, { status: 400, message: 'La nueva contraseña es requerida' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, { status: 400, message: 'Token inválido o expirado' });
    }

    user.password = targetPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    logger.error('Error en reset password confirm', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc Generar 2FA (A2F)
export const generate2fa = async (req, res) => {
  try {
    const user = await User.findById(req.user?.sub);
    if (!user) return sendError(res, { status: 404, message: 'Usuario no encontrado' });

    const secret = authenticator.generateSecret();
    user.twoFactorSecret = secret;
    await user.save();

    const otpauth = authenticator.keyuri(user.email, 'SYSCOM-GAZA', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    return sendSuccess(res, {
      message: 'A2F generado',
      data: { secret, qrCodeUrl }
    });
  } catch (error) {
    logger.error('Error generando A2F', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor' });
  }
};

// @desc Verificar y Activar 2FA
export const verify2fa = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user?.sub);
    
    if (!user || !user.twoFactorSecret) {
      return sendError(res, { status: 400, message: 'A2F no ha sido generado' });
    }

    const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
    if (!isValid) {
      return sendError(res, { status: 400, message: 'Código inválido' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    return sendSuccess(res, { message: 'Autenticación de 2 Factores activada correctamente' });
  } catch (error) {
    logger.error('Error verificando A2F', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor' });
  }
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

// @desc    Enviar correos promocionales a usuarios
export const sendPromoEmail = async (req, res) => {
  try {
    const { subject, htmlBody, targetRole } = req.body;
    if (!subject || !htmlBody) {
      return sendError(res, { status: 400, message: 'El asunto y el cuerpo del correo son requeridos.' });
    }

    const filter = {};
    if (targetRole) {
      filter.role = targetRole;
    }

    const users = await User.find(filter).select('email name');
    if (users.length === 0) {
      return sendSuccess(res, { message: 'No hay usuarios destinatarios.' });
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      // Personalizar el correo con el nombre si se desea, o simplemente enviar
      const personalizedHtml = htmlBody.replace(/{{name}}/g, user.name || 'Usuario');
      const sent = await sendEmail({
        to: user.email,
        subject,
        html: personalizedHtml,
        text: subject // fallback básico
      });

      if (sent) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return sendSuccess(res, {
      message: `Campaña promocional procesada.`,
      data: {
        totalDestinatarios: users.length,
        enviadosExitosamente: successCount,
        fallidos: failCount
      }
    });
  } catch (error) {
    logger.error('Error enviando correos promocionales', { message: error.message });
    return sendError(res, { status: 500, message: 'Error en el servidor', error: error.message });
  }
};

// @desc    Probar servicio de correo de restablecimiento
export const testEmailService = async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = email || process.env.EMAIL_USER;
    const testUrl = `${req.headers.origin || 'http://localhost:5173'}/reset/test_token_${Date.now()}`;
    const sent = await sendPasswordResetEmail(targetEmail, testUrl);
    if (sent) {
      return sendSuccess(res, { message: `Correo de restablecimiento enviado exitosamente a ${targetEmail}` });
    } else {
      return sendError(res, { status: 500, message: 'Fallo al enviar el correo. Revisa las credenciales en .env o logs.' });
    }
  } catch (error) {
    logger.error('Error en testEmailService', { message: error.message });
    return sendError(res, { status: 500, message: error.message });
  }
};