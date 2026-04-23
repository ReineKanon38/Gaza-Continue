/**
 * Configuración de moneda y tipo de cambio
 */

import { logger } from '../utils/logger.js';

export const CURRENCY_CONFIG = {
  // Tipo de cambio USD a MXN
  // Actualizar este valor según el tipo de cambio actual
  USD_TO_MXN: 17.5, // 1 USD = 17.5 MXN (ajustar según necesidad)
  
  // Moneda de SYSCOM
  SYSCOM_CURRENCY: 'USD',
  
  // Moneda de la plataforma
  PLATFORM_CURRENCY: 'MXN',
  
  // Formato de moneda
  CURRENCY_SYMBOL: '$',
  CURRENCY_CODE: 'MXN',
  
  // Redondeo de precios
  ROUND_TO_CENTS: true, // true = redondear a centavos, false = redondear a pesos
};

/**
 * Convierte un precio de USD a MXN
 * @param {number} priceUSD - Precio en dólares
 * @returns {number} - Precio en pesos mexicanos
 */
export function convertUSDtoMXN(priceUSD) {
  if (!priceUSD || isNaN(priceUSD)) {
    return 0;
  }
  
  const priceInMXN = priceUSD * CURRENCY_CONFIG.USD_TO_MXN;
  
  if (CURRENCY_CONFIG.ROUND_TO_CENTS) {
    // Redondear a centavos (2 decimales)
    return Math.round(priceInMXN * 100) / 100;
  } else {
    // Redondear a pesos (sin decimales)
    return Math.round(priceInMXN);
  }
}

/**
 * Formatea un precio en MXN para mostrar
 * @param {number} priceMXN - Precio en pesos mexicanos
 * @returns {string} - Precio formateado
 */
export function formatPriceMXN(priceMXN) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(priceMXN);
}

/**
 * Actualiza el tipo de cambio
 * @param {number} newRate - Nuevo tipo de cambio
 */
export function updateExchangeRate(newRate) {
  if (newRate && newRate > 0) {
    CURRENCY_CONFIG.USD_TO_MXN = newRate;
    logger.info(`Tipo de cambio actualizado: 1 USD = ${newRate} MXN`);
  }
}
