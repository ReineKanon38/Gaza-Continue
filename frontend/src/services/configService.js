const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function requestJson(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = data?.error || data?.message || res.statusText || 'Error en la peticion';
    throw new Error(err);
  }

  return data;
}

export const getSystemConfig = async () => requestJson('/api/config');

export const updatePaymentMethods = async (payload) => {
  return requestJson('/api/config/payment-methods', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};

export const updateShippingMethods = async (shippingMethods) => {
  return requestJson('/api/config/shipping-methods', {
    method: 'PUT',
    body: JSON.stringify({ shippingMethods })
  });
};

export default {
  getSystemConfig,
  updatePaymentMethods,
  updateShippingMethods
};
