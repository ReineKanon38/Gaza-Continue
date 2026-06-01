import { requestJson } from './httpClient';

export const getAllUsers = async () => {
  const data = await requestJson('/api/auth/users');
  return data.users || data.data || [];
};

export const updateUserRole = async (userId, role) => {
  return requestJson(`/api/auth/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

export const updateUserStatus = async (userId, isBlocked) => {
  return requestJson(`/api/auth/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isBlocked }),
  });
};

export const deleteUser = async (userId) => {
  return requestJson(`/api/auth/users/${userId}`, {
    method: 'DELETE',
  });
};

export default {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
