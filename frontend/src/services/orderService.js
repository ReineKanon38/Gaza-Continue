import { requestJson } from './httpClient';

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
