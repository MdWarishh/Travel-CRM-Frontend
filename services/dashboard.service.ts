import api from '@/lib/api';
import type { DashboardResponse } from '@/types/dashboard.types';

export const dashboardService = {
  getData: async (): Promise<DashboardResponse> => {
    const res = await api.get<DashboardResponse>('/dashboard');
    return res.data;
  },
};