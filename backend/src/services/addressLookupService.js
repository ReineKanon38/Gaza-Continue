import axios from 'axios';

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// Uses https://sepomex.kurenn.dev/ — free, open source API for SEPOMEX MX postal codes.
// Returns state, city, municipality and a list of neighborhoods (colonias).
export const lookupMexicanZipCode = async (zipCode) => {
  const normalizedZip = String(zipCode || '').replace(/\D/g, '').slice(0, 5);
  if (!/^\d{5}$/.test(normalizedZip)) {
    throw new Error('CP invalido');
  }

  const cached = cache.get(normalizedZip);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `https://sepomex.kurenn.dev/api/v1/zip_codes?zip_code=${normalizedZip}`;

  const response = await axios.get(endpoint, {
    timeout: 8000,
    headers: { Accept: 'application/json' }
  });

  const zipCodes = response?.data?.zip_codes;
  if (!Array.isArray(zipCodes) || zipCodes.length === 0) {
    throw new Error('CP no encontrado');
  }

  const first = zipCodes[0];
  const state = first['d_estado'] || '';
  const municipality = first['d_mnpio'] || '';
  const city = first['d_ciudad'] || municipality;
  
  // Extract all neighborhoods (colonias)
  const neighborhoods = [...new Set(zipCodes.map((p) => p['d_asenta']).filter(Boolean))];

  const mapped = {
    zipCode: normalizedZip,
    state,
    city,
    municipality,
    locality: '',
    neighborhoods,
    options: { states: [state], cities: [city], municipalities: [municipality], localities: [] }
  };

  cache.set(normalizedZip, { timestamp: Date.now(), data: mapped });

  return mapped;
};
