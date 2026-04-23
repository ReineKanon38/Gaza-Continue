const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function requestJson(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = data?.error || data?.message || res.statusText || 'Error en la petición';
    throw new Error(err);
  }
  return data;
}

export const paymentService = {
  createPaymentSession: async ({ amount, items, orderId, provider }) => {
    return requestJson('/api/payment/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, items, orderId, provider }),
    });
  },

  confirmPaymentSession: async ({ paymentSessionId, provider }) => {
    return requestJson('/api/payment/confirm-payment', {
      method: 'POST',
      body: JSON.stringify({ paymentSessionId, provider }),
    });
  },

  getPaymentMethods: async () => {
    return requestJson('/api/payment/methods', {
      method: 'GET',
    });
  },

  // Backward compatibility wrappers
  createPaymentIntent: async (amount, items, orderId, provider) => {
    return paymentService.createPaymentSession({ amount, items, orderId, provider });
  },

  confirmPayment: async (paymentSessionId, provider) => {
    return paymentService.confirmPaymentSession({ paymentSessionId, provider });
  }
};