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

export const createOrder = async (orderData) => {
  return requestJson('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
};

export const getAllOrders = async (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  const data = await requestJson(`/api/orders/admin/all${query ? `?${query}` : ''}`);
  return data.data ? { orders: data.data, pagination: data.pagination } : data;
};

export const getOrderById = async (orderId) => {
  return requestJson(`/api/orders/${orderId}`);
};

export const getOrderTracking = async (orderId) => {
  const data = await requestJson(`/api/orders/${orderId}/tracking`);
  return data?.data || null;
};

export const updateOrderStatus = async (orderId, status, options = {}) => {
  return requestJson(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, ...(options || {}) }),
  });
};

export const approveOrderPayment = async (orderId, payload = {}) => {
  return requestJson(`/api/orders/${orderId}/payment/approve`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const rejectOrderPayment = async (orderId, payload) => {
  return requestJson(`/api/orders/${orderId}/payment/reject`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const getUserOrders = async () => {
  const data = await requestJson('/api/orders');
  return data.data ? { orders: data.data, pagination: data.pagination } : data;
};

export default {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderTracking,
  updateOrderStatus,
  approveOrderPayment,
  rejectOrderPayment,
  getUserOrders,
};
