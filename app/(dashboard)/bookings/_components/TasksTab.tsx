'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookingTask } from '@/types/booking';
import { bookingsService } from '@/services/bookings.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  bookingId: string;
  tasks: BookingTask[];
  onChange: (tasks: BookingTask[]) => void;
}

export function TasksTab({ bookingId, tasks, onChange }: Props) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const completed = tasks.filter((t) => t.isCompleted).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    try {
      setAdding(true);
      const task = await bookingsService.addTask(bookingId, newTitle.trim());
      onChange([...tasks, task]);
      setNewTitle('');
      toast.success('Task added');
    } catch { toast.error('Failed to add task'); }
    finally { setAdding(false); }
  };

  const handleToggle = async (taskId: string) => {
    try {
      setTogglingId(taskId);
      const updated = await bookingsService.toggleTask(bookingId, taskId);
      onChange(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch { toast.error('Failed to update task'); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await bookingsService.deleteTask(bookingId, taskId);
      onChange(tasks.filter((t) => t.id !== taskId));
      toast.success('Task removed');
    } catch { toast.error('Failed to delete task'); }
  };

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Checklist Progress</h3>
          <span className="text-sm font-bold text-slate-900">{completed}/{tasks.length} done</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500',
              progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : 'bg-amber-500'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{progress}% complete</p>
      </div>

      {/* Task list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Tasks</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {tasks.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-400">No tasks yet</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 group transition-colors">
                <button
                  onClick={() => handleToggle(task.id)}
                  disabled={togglingId === task.id}
                  className="shrink-0 text-slate-400 hover:text-emerald-500 transition-colors"
                >
                  {togglingId === task.id
                    ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                    : task.isCompleted
                    ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    : <Circle className="h-5 w-5" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', task.isCompleted ? 'line-through text-slate-400' : 'text-slate-700')}>
                    {task.title}
                  </p>
                  {task.isDefault && (
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Default</span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="rounded-xl border-slate-200 bg-white"
        />
        <Button onClick={handleAdd} disabled={adding || !newTitle.trim()} className="rounded-xl bg-slate-900 hover:bg-slate-800 gap-2 shrink-0">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add
        </Button>
      </div>
    </div>
  );
}