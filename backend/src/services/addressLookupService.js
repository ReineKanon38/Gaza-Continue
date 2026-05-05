import axios from 'axios';

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

// Uses https://api.zippopotam.us — free, no token required, covers MX postal codes.
// Returns state + delegacion/city. Neighborhoods are not available from this API.
export const lookupMexicanZipCode = async (zipCode) => {
  const normalizedZip = String(zipCode || '').replace(/\D/g, '').slice(0, 5);
  if (!/^\d{5}$/.test(normalizedZip)) {
    throw new Error('CP invalido');
  }

  const cached = cache.get(normalizedZip);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    return cached.data;
  }

  const endpoint = `https://api.zippopotam.us/mx/${normalizedZip}`;

  const response = await axios.get(endpoint, {
    timeout: 8000,
    headers: { Accept: 'application/json' }
  });

  const places = response?.data?.places;
  if (!Array.isArray(places) || places.length === 0) {
    throw new Error('CP no encontrado');
  }

  // Build unique sets from all places for this zip code
  const states = [...new Set(places.map((p) => p['state']).filter(Boolean))];
  const cities = [...new Set(places.map((p) => p['place name']).filter(Boolean))];

  const first = places[0];
  const state = first['state'] || '';
  // In Mexico, "place name" from zippopotam corresponds to delegación/municipio
  const municipality = first['place name'] || '';
  const city = municipality;

  const mapped = {
    zipCode: normalizedZip,
    state,
    city,
    municipality,
    locality: '',
    neighborhoods: [],
    options: { states, cities, municipalities: cities, localities: [] }
  };

  cache.set(normalizedZip, { timestamp: Date.now(), data: mapped });

  return mapped;
};
