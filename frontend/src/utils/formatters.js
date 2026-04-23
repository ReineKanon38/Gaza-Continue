// src/utils/formatters.js

/**
 * Formatea un número como moneda en pesos mexicanos
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada (ej: $1,234.50)
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} dateString - Fecha a formatear
 * @param {boolean} includeTime - Si incluir la hora
 * @returns {string} - Fecha formateada (ej: 15 de enero de 2024)
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  return new Intl.DateTimeFormat('es-MX', options).format(date);
};

/**
 * Formatea una fecha en formato corto
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Fecha formateada corta (ej: 15/01/2024)
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formatea porcentaje
 * @param {number} value - Valor decimal (0-1)
 * @param {number} decimals - Decimales a mostrar
 * @returns {string} - Porcentaje formateado (ej: 25.50%)
 */
export const formatPercent = (value, decimals = 2) => {
  if (typeof value !== 'number') return '0%';
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - Cadena a capitalizar
 * @returns {string} - Cadena capitalizada
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formatea un número con separadores de miles
 * @param {number} num - Número a formatear
 * @param {number} decimals - Decimales
 * @returns {string} - Número formateado
 */
export const formatNumber = (num, decimals = 0) => {
  if (typeof num !== 'number') return '0';
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Trunca un texto
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @returns {string} - Texto truncado
 */
export const truncate = (text, length = 50) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Formatea teléfono mexicano
 * @param {string} phone - Número telefónico
 * @returns {string} - Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '+52 $1 $2 $3');
  }
  
  return phone;
};
