const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://syscomgaza.com',
  'https://www.syscomgaza.com',
  'http://syscomgaza.com',
  'http://www.syscomgaza.com'
];

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAnyOrigin = configuredOrigins.includes('*');
const allowedOrigins = new Set(
  allowAnyOrigin || configuredOrigins.length === 0
    ? DEFAULT_ALLOWED_ORIGINS
    : configuredOrigins
);

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowAnyOrigin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    // Permitir cualquier variante de syscomgaza.com
    if (/^https?:\/\/([a-zA-Z0-9-]+\.)*syscomgaza\.com(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }

    // Permitir acceso desde red local (192.168.* o 10.* o 172.*) en desarrollo
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(192\.168\.|10\.|172\.|localhost|127\.0\.0\.1)/.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

export const allowedCorsOrigins = allowAnyOrigin ? '*' : Array.from(allowedOrigins);