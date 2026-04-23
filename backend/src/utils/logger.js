const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

const shouldLogInfo = !isProduction && !isTest;
const shouldLogDebug = !isProduction;

function stringifyMeta(meta) {
  if (meta === undefined) return '';
  if (typeof meta === 'string') return meta;

  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

function formatMessage(level, message, meta) {
  const suffix = stringifyMeta(meta);
  return suffix ? `[${level}] ${message} ${suffix}` : `[${level}] ${message}`;
}

export const logger = {
  debug(message, meta) {
    if (shouldLogDebug) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },

  info(message, meta) {
    if (shouldLogInfo) {
      console.log(formatMessage('INFO', message, meta));
    }
  },

  warn(message, meta) {
    console.warn(formatMessage('WARN', message, meta));
  },

  error(message, meta) {
    console.error(formatMessage('ERROR', message, meta));
  }
};
