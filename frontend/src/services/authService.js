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
    throw new Error(data?.message || data?.error || 'Error de autenticacion');
  }

  return data;
}

export const getMyProfile = async () => {
  const data = await requestJson('/api/auth/me');
  return data?.data || null;
};

export const getSavedShippingAddress = async () => {
  const data = await requestJson('/api/auth/shipping-address');
  return data?.data || null;
};

export const updateSavedShippingAddress = async (addressPayload) => {
  const data = await requestJson('/api/auth/shipping-address', {
    method: 'PUT',
    body: JSON.stringify(addressPayload)
  });
  return data?.data || null;
};

export default {
  getMyProfile,
  getSavedShippingAddress,
  updateSavedShippingAddress
};
