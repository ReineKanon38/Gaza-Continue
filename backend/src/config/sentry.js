// backend/src/config/sentry.js
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { logger } from '../utils/logger.js';

export const initSentry = (app) => {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    logger.warn('⚠️ SENTRY_DSN no configurado en .env. El monitoreo en vivo de Sentry está en pausa.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'production',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Muestreo de trazas de rendimiento en producción (20% para optimización de recursos)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    profilesSampleRate: 1.0,
  });

  // 🚨 SECOPS/DEVOPS: Captura de excepciones globales antes de reinicio del proceso (Zero Data Loss)
  process.on('uncaughtException', (error) => {
    logger.error('💥 UNCAUGHT EXCEPTION crítica. Enviando reporte a Sentry antes de reiniciar...', {
      message: error.message,
      stack: error.stack
    });
    
    Sentry.captureException(error);

    // Asegurar que el log llegue a los servidores de Sentry antes de que el proceso finalice
    Sentry.flush(2000).finally(() => {
      process.exit(1); // El proceso es reiniciado automáticamente por PM2 / Docker / Systemd
    });
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('🚨 UNHANDLED REJECTION detectada. Enviando reporte a Sentry...', { reason });
    Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
  });

  logger.info('🛡️ Sentry inicializado correctamente para Backend Express');
};

export { Sentry };
