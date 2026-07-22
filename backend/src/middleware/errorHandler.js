import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

let Sentry = null;
try {
  Sentry = await import('@sentry/node');
} catch (e) {
  // @sentry/node opcional antes de npm install
}

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { message: err?.message, stack: err?.stack });

  // 🛡️ Capturar excepción en Sentry con contexto HTTP del usuario (solo si Sentry está instalado y configurado)
  if (Sentry?.captureException && process.env.SENTRY_DSN && (!err.status || err.status >= 500)) {
    Sentry.captureException(err, {
      extra: {
        url: req.originalUrl,
        method: req.method,
        query: req.query,
        user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
      },
    });
  }

  if (res.headersSent) {
    return next(err);
  }
  const status = err?.status || 500;
  return sendError(res, {
    status,
    message: err?.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? undefined : err?.stack,
  });
};
