const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const couponService = {
  // Obtener todos los cupones (solo admin)
  getAllCoupons: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener cupones');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Validar cupón
  validateCoupon: async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });
      if (!response.ok) throw new Error('Cupón no válido');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Aplicar cupón
  applyCoupon: async (code, orderAmount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, orderAmount })
      });
      if (!response.ok) throw new Error('Error al aplicar cupón');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Crear cupón
  createCoupon: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear cupón');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar cupón
  updateCoupon: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar cupón');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Eliminar cupón
  deleteCoupon: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar cupón');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default couponService;
