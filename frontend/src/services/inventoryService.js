const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const inventoryService = {
  // Obtener inventario completo
  getInventory: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener inventario');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener stock de un producto
  getProductStock: async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener stock');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar stock
  updateStock: async (productId, quantity, operation = 'set') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/product/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity, operation })
      });
      if (!response.ok) throw new Error('Error al actualizar stock');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar stock en lote
  bulkUpdateStock: async (productIds, quantity, operation = 'add') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/bulk-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds, quantity, operation })
      });
      if (!response.ok) throw new Error('Error al actualizar stock en lote');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Activar/desactivar productos en lote
  bulkUpdateProductStatus: async (productIds, active) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/bulk-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds, active })
      });
      if (!response.ok) throw new Error('Error al actualizar estado de productos');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener productos con bajo stock
  getLowStockProducts: async (threshold = 5) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock?threshold=${threshold}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener productos con bajo stock');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener productos sin stock
  getOutOfStockProducts: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/out-of-stock`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener productos sin stock');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener valor total del inventario
  getInventoryValue: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/inventory/value`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al obtener valor del inventario');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default inventoryService;
