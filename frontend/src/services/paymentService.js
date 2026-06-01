import { requestJson } from './httpClient';

export const paymentService = {
  createPaymentSession: async ({ amount, items, orderId, provider }) => {
    return requestJson('/api/payment/create-session', {
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
  }
};