'use client';

// ═══════════════════════════════════════════════════════════════
// TASK TAB
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsService } from '@/services/leads.service';
import { PipelineLead } from '@/types/leads.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus, CheckCircle2, Clock, XCircle, Loader2, Trash2,
  Flame, Minus, ChevronDown, ClipboardList,
} from 'lucide-react';

const TASK_STATUS: Record<string, { label: string; icon: any; cls: string }> = {
  TODO:        { label: 'To Do',      icon: Clock,        cls: 'bg-slate-100 text-slate-600 border-slate-200'     },
  IN_PROGRESS: { label: 'In Progress',icon: Loader2,      cls: 'bg-blue-50 text-blue-600 border-blue-200'        },
  DONE:        { label: 'Done',       icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CANCELLED:   { label: 'Cancelled',  icon: XCircle,      cls: 'bg-red-50 text-red-500 border-red-200'           },
};

const TASK_PRIORITY: Record<string, { label: string; cls: string }> = {
  LOW:    { label: 'Low',    cls: 'bg-slate-100 text-slate-500 border-slate-200'   },
  MEDIUM: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border-amber-200'    },
  HIGH:   { label: 'High',   cls: 'bg-red-50 text-red-600 border-red-200'         },
};

export function TaskTab({ lead }: { lead: PipelineLead }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueAt: '' });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['lead-tasks', lead.id],
    queryFn: () => leadsService.getTasks(lead.id),
  });

  const createMut = useMutation({
    mutationFn: (data: any) => leadsService.createTask(lead.id, data),
    onSuccess: () => {
      toast.success('Task created');
      qc.invalidateQueries({ queryKey: ['lead-tasks', lead.id] });
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'MEDIUM', dueAt: '' });
    },
    onError: () => toast.error('Failed to create task'),
  });

  const updateMut = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      leadsService.updateTask(lead.id, taskId, data),
    onSuccess: () => {
      toast.success('Task updated');
      qc.invalidateQueries({ queryKey: ['lead-tasks', lead.id] });
    },
    onError: () => toast.error('Failed to update task'),
  });

  const deleteMut = useMutation({
    mutationFn: (taskId: string) => leadsService.deleteTask(lead.id, taskId),
    onSuccess: () => {
      toast.success('Task deleted');
      qc.invalidateQueries({ queryKey: ['lead-tasks', lead.id] });
    },
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">{tasks.length} Task{tasks.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Task
        </Button>
      </div>

      {showForm && (
        <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">New Task</p>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Title <span className="text-red-500">*</span></Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Task title…"
              className="h-8 text-xs border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}>
                <SelectTrigger className="h-8 text-xs border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW" className="text-xs">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="text-xs">Medium</SelectItem>
                  <SelectItem value="HIGH" className="text-xs">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-slate-600">Due Date</Label>
              <Input
                type="datetime-local"
                value={form.dueAt}
                onChange={(e) => setForm((p) => ({ ...p, dueAt: e.target.value }))}
                className="h-8 text-xs border-slate-200"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-600">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Task details…"
              rows={2}
              className="text-xs border-slate-200 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="h-7 text-xs">Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!form.title.trim()) { toast.error('Title is required'); return; }
              createMut.mutate(form);
            }} disabled={createMut.isPending}
              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {createMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <ClipboardList className="w-10 h-10 mb-3 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No tasks yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task: any) => {
            const st = TASK_STATUS[task.status] ?? TASK_STATUS.TODO;
            const pr = TASK_PRIORITY[task.priority] ?? TASK_PRIORITY.MEDIUM;
            const StIcon = st.icon;
            return (
              <div key={task.id} className={cn(
                'border rounded-xl p-3.5 space-y-2 bg-white hover:shadow-sm transition-all',
                task.status === 'DONE' && 'opacity-60',
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      onClick={() => updateMut.mutate({
                        taskId: task.id,
                        data: { status: task.status === 'DONE' ? 'TODO' : 'DONE' },
                      })}
                      className="flex-shrink-0"
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                        task.status === 'DONE' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-emerald-400',
                      )}>
                        {task.status === 'DONE' && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                    <div className="min-w-0">
                      <p className={cn('text-xs font-semibold text-slate-700 truncate', task.status === 'DONE' && 'line-through text-slate-400')}>{task.title}</p>
                      {task.dueAt && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          Due: {new Date(task.dueAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 font-medium', pr.cls)}>{pr.label}</Badge>
                    <Select value={task.status} onValueChange={(v) => updateMut.mutate({ taskId: task.id, data: { status: v } })}>
                      <SelectTrigger className="h-5 text-[10px] border-slate-200 px-1.5 gap-1 w-auto">
                        <StIcon className="w-2.5 h-2.5" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TASK_STATUS).map(([k, v]) => (
                          <SelectItem key={k} value={k} className="text-xs">{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => deleteMut.mutate(task.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {task.description && (
                  <p className="text-[12px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">{task.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}