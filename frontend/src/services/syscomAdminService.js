const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const syscomAdminService = {
  getHealthMetrics: async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/syscom/health`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Error al obtener métricas de SYSCOM');
    }

    return data?.data || null;
  },

  getHealthHistory: async ({ minutes = 180, limit = 72 } = {}) => {
    const token = localStorage.getItem('token');
    const query = new URLSearchParams({
      minutes: String(minutes),
      limit: String(limit)
    });

    const response = await fetch(`${API_BASE_URL}/api/syscom/health/history?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'Error al obtener histórico de SYSCOM');
    }

    return data?.data || { points: [] };
  }
};

export default syscomAdminService;
