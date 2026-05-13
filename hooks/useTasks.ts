'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { taskService } from '@/services/task.service';
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskQueryParams,
  TaskStatus,
} from '@/types/task.types';

// ─────────────────────────────────────────────────────────────────────────────
// QUERY KEYS
// ─────────────────────────────────────────────────────────────────────────────
export const taskKeys = {
  all:    ['tasks'] as const,
  lists:  () => [...taskKeys.all, 'list'] as const,
  list:   (params: TaskQueryParams) => [...taskKeys.lists(), params] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  stats:  () => [...taskKeys.all, 'stats'] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// useTasks — paginated list with filters
// ─────────────────────────────────────────────────────────────────────────────
export const useTasks = (params: TaskQueryParams = {}) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn:  () => taskService.getAll(params),
    staleTime: 30_000,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useTask — single task detail
// ─────────────────────────────────────────────────────────────────────────────
export const useTask = (id: string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn:  () => taskService.getById(id),
    enabled:  !!id,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useTaskStats — dashboard stats
// ─────────────────────────────────────────────────────────────────────────────
export const useTaskStats = () => {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn:  taskService.getStats,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useCreateTask
// ─────────────────────────────────────────────────────────────────────────────
export const useCreateTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.stats() });
      toast.success('Task created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create task');
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useUpdateTask
// ─────────────────────────────────────────────────────────────────────────────
export const useUpdateTask = (id: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) });
      qc.invalidateQueries({ queryKey: taskKeys.stats() });
      toast.success('Task updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update task');
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useUpdateTaskStatus — quick status toggle
// ─────────────────────────────────────────────────────────────────────────────
export const useUpdateTaskStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskService.updateStatus(id, { status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.stats() });
      const label = status === 'COMPLETED' ? 'marked complete' : 'updated';
      toast.success(`Task ${label}!`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useDeleteTask
// ─────────────────────────────────────────────────────────────────────────────
export const useDeleteTask = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() });
      qc.invalidateQueries({ queryKey: taskKeys.stats() });
      toast.success('Task deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete task');
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// useTaskFilters — local filter state management
// ─────────────────────────────────────────────────────────────────────────────
export const useTaskFilters = () => {
  const [params, setParams] = useState<TaskQueryParams>({
    page: 1,
    limit: 20,
    filter: 'all',
  });

  const setFilter   = useCallback((filter: TaskQueryParams['filter']) =>
    setParams(p => ({ ...p, filter, page: 1 })), []);

  const setSearch   = useCallback((search: string) =>
    setParams(p => ({ ...p, search: search || undefined, page: 1 })), []);

  const setPriority = useCallback((priority: TaskQueryParams['priority']) =>
    setParams(p => ({ ...p, priority, page: 1 })), []);

  const setType     = useCallback((type: TaskQueryParams['type']) =>
    setParams(p => ({ ...p, type, page: 1 })), []);

  const setPage     = useCallback((page: number) =>
    setParams(p => ({ ...p, page })), []);

  const reset       = useCallback(() =>
    setParams({ page: 1, limit: 20, filter: 'all' }), []);

  return { params, setFilter, setSearch, setPriority, setType, setPage, reset };
};