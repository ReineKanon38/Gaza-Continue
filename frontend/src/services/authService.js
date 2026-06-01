import { requestJson } from './httpClient';

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
