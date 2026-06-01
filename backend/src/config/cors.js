const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
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

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

export const allowedCorsOrigins = allowAnyOrigin ? '*' : Array.from(allowedOrigins);