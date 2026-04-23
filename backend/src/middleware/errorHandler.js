import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', { message: err?.message });
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
