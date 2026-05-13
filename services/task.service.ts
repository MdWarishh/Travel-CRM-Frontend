import axios from '@/lib/api';
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
  TaskListResponse,
  TaskResponse,
  TaskStatsResponse,
  TaskQueryParams,
} from '@/types/task.types';

const BASE = '/tasks';

export const taskService = {
  // ── List all tasks (with filters & pagination) ───────────────────────────
  getAll: async (params?: TaskQueryParams): Promise<TaskListResponse> => {
    const { data } = await axios.get<TaskListResponse>(BASE, { params });
    return data;
  },

  // ── Get single task ──────────────────────────────────────────────────────
  getById: async (id: string): Promise<TaskResponse> => {
    const { data } = await axios.get<TaskResponse>(`${BASE}/${id}`);
    return data;
  },

  // ── Create task ──────────────────────────────────────────────────────────
  create: async (payload: CreateTaskPayload): Promise<TaskResponse> => {
    const { data } = await axios.post<TaskResponse>(BASE, payload);
    return data;
  },

  // ── Update task ──────────────────────────────────────────────────────────
  update: async (id: string, payload: UpdateTaskPayload): Promise<TaskResponse> => {
    const { data } = await axios.put<TaskResponse>(`${BASE}/${id}`, payload);
    return data;
  },

  // ── Update status only ───────────────────────────────────────────────────
  updateStatus: async (id: string, payload: UpdateTaskStatusPayload): Promise<TaskResponse> => {
    const { data } = await axios.patch<TaskResponse>(`${BASE}/${id}/status`, payload);
    return data;
  },

  // ── Delete task ──────────────────────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${BASE}/${id}`);
  },

  // ── Dashboard stats ──────────────────────────────────────────────────────
  getStats: async (): Promise<TaskStatsResponse> => {
    const { data } = await axios.get<TaskStatsResponse>(`${BASE}/stats`);
    return data;
  },

  // ── Users list for assignee dropdown ─────────────────────────────────────
  // NOTE: 'status' param removed — backend /users route does not accept it
  // and returns 400. We fetch all users and filter ACTIVE on the client side.
  getUsers: async (): Promise<{ id: string; name: string; email: string; role: string }[]> => {
    const { data } = await axios.get('/users', {
      params: { limit: 100 },
    });

    // Handle all known backend response shapes:
    // Shape 1: { data: { users: [...] } }
    // Shape 2: { data: [...] }
    // Shape 3: { users: [...] }
    const raw: { id: string; name: string; email: string; role: string; status?: string }[] =
      data?.data?.users ??
      data?.data ??
      data?.users ??
      [];

    if (!Array.isArray(raw)) return [];

    // Filter only ACTIVE users on the client side
    return raw.filter((u) => !u.status || u.status === 'ACTIVE');
  },
};