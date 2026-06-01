import { requestJson } from './httpClient';

const syscomAdminService = {
  getHealthMetrics: async () => {
    const data = await requestJson('/api/syscom/health');

    return data?.data || null;
  },

  getHealthHistory: async ({ minutes = 180, limit = 72 } = {}) => {
    const query = new URLSearchParams({
      minutes: String(minutes),
      limit: String(limit)
    });

    const data = await requestJson(`/api/syscom/health/history?${query.toString()}`);

    return data?.data || { points: [] };
  }
};

export default syscomAdminService;
