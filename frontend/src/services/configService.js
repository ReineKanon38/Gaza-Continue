import { requestJson } from './httpClient';

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
