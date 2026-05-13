import api from '@/lib/api';
import {
  User,
  UserStats,
  CustomRole,
  RolePermission,
  ActivityLog,
  CreateUserPayload,
  UpdateUserPayload,
  ChangePasswordPayload,
  CreateRolePayload,
  UpdatePermissionsPayload,
  UserQueryParams,
  PaginatedResponse,
  ApiResponse,
} from '@/types/users';

// ═════════════════════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════════════════════

export const usersService = {
  // List with filters, search, pagination
  getAll: async (params?: UserQueryParams): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>('/users', { params });
    return res.data;
  },

  getById: async (id: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  create: async (data: CreateUserPayload): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  update: async (id: string, data: UpdateUserPayload): Promise<User> => {
    const res = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  toggleStatus: async (id: string): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  changePassword: async (id: string, data: ChangePasswordPayload): Promise<void> => {
    await api.patch(`/users/${id}/change-password`, data);
  },

  getStats: async (): Promise<UserStats> => {
    const res = await api.get<ApiResponse<UserStats>>('/users/stats');
    return res.data.data;
  },

  getPermissions: async (id: string): Promise<RolePermission[]> => {
    const res = await api.get<ApiResponse<RolePermission[]>>(`/users/${id}/permissions`);
    return res.data.data;
  },

  getActivity: async (
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ActivityLog>> => {
    const res = await api.get<PaginatedResponse<ActivityLog>>(`/users/${id}/activity`, { params });
    return res.data;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// MY PROFILE (self)
// ═════════════════════════════════════════════════════════════════════════════

export const profileService = {
  get: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>('/users/me');
    return res.data.data;
  },

  update: async (data: Pick<UpdateUserPayload, 'name' | 'phone' | 'profileImage' | 'department'>): Promise<User> => {
    const res = await api.put<ApiResponse<User>>('/users/me', data);
    return res.data.data;
  },

  changePassword: async (data: ChangePasswordPayload): Promise<void> => {
    await api.patch('/users/me/change-password', data);
  },

  getPermissions: async (): Promise<RolePermission[]> => {
    const res = await api.get<ApiResponse<RolePermission[]>>('/users/me/permissions');
    return res.data.data;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// ROLES
// ═════════════════════════════════════════════════════════════════════════════

export const rolesService = {
  getAll: async (): Promise<CustomRole[]> => {
    const res = await api.get<ApiResponse<CustomRole[]>>('/users/roles/all');
    return res.data.data;
  },

  getById: async (id: string): Promise<CustomRole> => {
    const res = await api.get<ApiResponse<CustomRole>>(`/users/roles/${id}`);
    return res.data.data;
  },

  create: async (data: CreateRolePayload): Promise<CustomRole> => {
    const res = await api.post<ApiResponse<CustomRole>>('/users/roles', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<CreateRolePayload>): Promise<CustomRole> => {
    const res = await api.put<ApiResponse<CustomRole>>(`/users/roles/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/roles/${id}`);
  },

  updatePermissions: async (roleId: string, data: UpdatePermissionsPayload): Promise<CustomRole> => {
    const res = await api.put<ApiResponse<CustomRole>>(
      `/users/roles/${roleId}/permissions`,
      data
    );
    return res.data.data;
  },
};

// ═════════════════════════════════════════════════════════════════════════════
// ACTIVITY LOGS
// ═════════════════════════════════════════════════════════════════════════════

export const activityLogsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const res = await api.get<PaginatedResponse<ActivityLog>>('/users/activity-logs', { params });
    return res.data;
  },
};