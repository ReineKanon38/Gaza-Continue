// frontend/src/services/sentry.js
import * as Sentry from '@sentry/react';

export const initFrontendSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.info('⚠️ VITE_SENTRY_DSN no configurado. Monitoreo frontend en pausa.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: true,
      }),
    ],
    // Muestreo de trazas de rendimiento y replays en producción
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

export { Sentry };
