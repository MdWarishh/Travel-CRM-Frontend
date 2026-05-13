import api from '@/lib/api';
import { AuthResponse, User } from '@/types';

export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', { email, password });
    return res.data.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; data: User }>('/auth/me');
    return res.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  },
};