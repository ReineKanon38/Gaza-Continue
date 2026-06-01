import { requestJson } from './httpClient';

const categoryService = {
  // Obtener todas las categorías
  getAllCategories: () => requestJson('/api/categories'),

  // Obtener categoría por ID
  getCategoryById: (id) => requestJson(`/api/categories/${id}`),

  // Crear categoría
  createCategory: (data) => requestJson('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Actualizar categoría
  updateCategory: (id, data) => requestJson(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Eliminar categoría
  deleteCategory: (id) => requestJson(`/api/categories/${id}`, {
    method: 'DELETE'
  })
};

export default categoryService;
