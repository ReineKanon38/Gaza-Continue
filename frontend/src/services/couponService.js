import { requestJson } from './httpClient';

const couponService = {
  // Obtener todos los cupones (solo admin)
  getAllCoupons: () => requestJson('/api/coupons'),

  // Validar cupón
  validateCoupon: (code) => requestJson('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),

  // Aplicar cupón
  applyCoupon: (code, orderAmount) => requestJson('/api/coupons/apply', {
    method: 'POST',
    body: JSON.stringify({ code, orderAmount })
  }),

  // Crear cupón
  createCoupon: (data) => requestJson('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Actualizar cupón
  updateCoupon: (id, data) => requestJson(`/api/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Eliminar cupón
  deleteCoupon: (id) => requestJson(`/api/coupons/${id}`, {
    method: 'DELETE'
  })
};

export default couponService;
