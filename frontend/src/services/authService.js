import { requestJson } from './httpClient';

export const loginUser = async (credentials) => {
  return await requestJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = async (userData) => {
  return await requestJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const requestPasswordReset = async (email) => {
  return await requestJson('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPassword = async (token, password) => {
  return await requestJson(`/api/auth/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ password })
  });
};

export const generate2FA = async () => {
  return await requestJson('/api/auth/2fa/generate', {
    method: 'POST'
  });
};

export const verify2FA = async (token) => {
  return await requestJson('/api/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
};

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
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  generate2FA,
  verify2FA,
  getMyProfile,
  getSavedShippingAddress,
  updateSavedShippingAddress
};
