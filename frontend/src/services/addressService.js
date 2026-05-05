const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function requestJson(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Error consultando CP');
  }

  return data;
}

export const lookupZipCode = async (zipCode) => {
  const data = await requestJson(`/api/address/zip/${zipCode}`);
  return data?.data || null;
};

export default {
  lookupZipCode
};
