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
