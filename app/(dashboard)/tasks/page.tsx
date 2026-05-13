'use client';

import { useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import TaskStatsCards  from './_components/TaskStatsCards';
import TaskFilters     from './_components/TaskFilters';
import TaskList        from './_components/TaskList';
import TaskFormDialog  from './_components/TaskFormDialog';
import TaskDetailSheet from './_components/TaskDetailSheet';

import { useTasks, useTaskFilters } from '@/hooks/useTasks';
import type { Task, TaskFilter, TaskPriority, TaskType } from '@/types/task.types';

export default function TasksPage() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [formOpen,       setFormOpen]       = useState(false);
  const [editingTask,    setEditingTask]     = useState<Task | null>(null);
  const [detailTask,     setDetailTask]      = useState<Task | null>(null);
  const [detailOpen,     setDetailOpen]      = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const { params, setFilter, setSearch, setPriority, setType, setPage, reset } = useTaskFilters();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useTasks(params);

  const tasks      = data?.data       ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openCreate = useCallback(() => {
    setEditingTask(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  }, []);

  const openDetail = useCallback((task: Task) => {
    setDetailTask(task);
    setDetailOpen(true);
  }, []);

  const handleFilterSelect = useCallback((filter: 'today' | 'upcoming' | 'overdue' | 'completed') => {
    setFilter(filter as TaskFilter);
  }, [setFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* ── Page header ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks & Reminders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Track tasks, meetings, and follow-ups across leads, customers & bookings
            </p>
          </div>
          <Button onClick={openCreate} size="sm" className="hidden sm:flex">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* ── Stats cards ───────────────────────────────────────────────── */}
        <TaskStatsCards onFilterSelect={handleFilterSelect} />

        <Separator />

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <TaskFilters
          params={params}
          onFilter={(f) => setFilter(f)}
          onSearch={setSearch}
          onPriority={(p) => setPriority(p)}
          onType={(t) => setType(t)}
          onReset={reset}
          totalResults={pagination.total}
        />

        {/* ── Task list ────────────────────────────────────────────────── */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          isFetching={isFetching}
          totalPages={pagination.totalPages}
          currentPage={pagination.page}
          onPageChange={setPage}
          onEdit={openEdit}
          onCreateNew={openCreate}
          emptyLabel={
            params.filter === 'overdue'   ? 'No overdue tasks 🎉' :
            params.filter === 'today'     ? 'No tasks due today'  :
            params.filter === 'completed' ? 'No completed tasks'  :
            'No tasks found'
          }
        />
      </div>

      {/* ── Mobile FAB ───────────────────────────────────────────────────── */}
      <button
        onClick={openCreate}
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* ── Dialogs / Sheets ─────────────────────────────────────────────── */}
      <TaskFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingTask(null); }}
        task={editingTask}
      />

      <TaskDetailSheet
        task={detailTask}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onEdit={(t) => { setDetailOpen(false); openEdit(t); }}
      />
    </div>
  );
}