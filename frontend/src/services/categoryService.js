const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const categoryService = {
  // Obtener todas las categorías
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error('Error al obtener categorías');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Obtener categoría por ID
  getCategoryById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
      if (!response.ok) throw new Error('Categoría no encontrada');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Crear categoría
  createCategory: async (data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al crear categoría');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Actualizar categoría
  updateCategory: async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Error al actualizar categoría');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar categoría');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};

export default categoryService;
