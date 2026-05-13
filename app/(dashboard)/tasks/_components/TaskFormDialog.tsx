'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input }    from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button }   from '@/components/ui/button';
import { Badge }    from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, CalendarClock, AlarmClock, User } from 'lucide-react';

import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import { taskService } from '@/services/task.service';
import type { Task } from '@/types/task.types';

// ─── Reminder options ────────────────────────────────────────────────────────
const REMINDER_OPTIONS = [
  { label: '5 minutes before',  value: 5    },
  { label: '10 minutes before', value: 10   },
  { label: '15 minutes before', value: 15   },
  { label: '30 minutes before', value: 30   },
  { label: '1 hour before',     value: 60   },
  { label: '2 hours before',    value: 120  },
  { label: '1 day before',      value: 1440 },
];

const TYPE_OPTIONS = [
  { value: 'TASK',      emoji: '📋', label: 'Task'      },
  { value: 'MEETING',   emoji: '🤝', label: 'Meeting'   },
  { value: 'FOLLOW_UP', emoji: '📞', label: 'Follow-up' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    cls: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium', cls: 'bg-amber-50 text-amber-700'  },
  { value: 'HIGH',   label: 'High',   cls: 'bg-red-50 text-red-700'      },
] as const;

// ─── Zod schema ───────────────────────────────────────────────────────────────
// Declare enums separately to avoid TS inference issues with zodResolver
const taskTypeValues    = ['TASK', 'MEETING', 'FOLLOW_UP'] as const;
const priorityValues    = ['LOW', 'MEDIUM', 'HIGH'] as const;
const relatedToValues   = ['LEAD', 'CUSTOMER', 'BOOKING'] as const;

const formSchema = z.object({
  title:                 z.string().min(1, 'Title is required'),
  description:           z.string().optional(),
  type:                  z.enum(taskTypeValues),
  relatedToType:         z.enum(relatedToValues).optional(),
  relatedToId:           z.string().optional(),
  assignedToId:          z.string().optional(),
  dueDateTime:           z.string().min(1, 'Due date & time is required'),
  reminderBeforeMinutes: z.coerce.number().min(0),
  priority:              z.enum(priorityValues),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskFormDialogProps {
  open:    boolean;
  onClose: () => void;
  task?:   Task | null;
  defaultRelatedToType?: 'LEAD' | 'CUSTOMER' | 'BOOKING';
  defaultRelatedToId?:   string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
const getMinDateTime = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  const offset = now.getTimezoneOffset();
  const local  = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function TaskFormDialog({
  open, onClose, task,
  defaultRelatedToType, defaultRelatedToId,
}: TaskFormDialogProps) {
  const isEdit = !!task;
  const create = useCreateTask();
  const update = useUpdateTask(task?.id ?? '');

  // ── Fetch users ───────────────────────────────────────────────────────────
  // taskService.getUsers already handles all backend response shapes:
  // { data: [...] }  /  { data: { users: [...] } }  /  { users: [...] }
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users-for-tasks'],
    queryFn:  taskService.getUsers,
    staleTime: 5 * 60 * 1000,
    enabled:  open,
  });

  // ── Form ──────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title:                 '',
      description:           '',
      type:                  'TASK',
      priority:              'MEDIUM',
      reminderBeforeMinutes: 30,
      dueDateTime:           '',
      relatedToType:         defaultRelatedToType ?? undefined,
      relatedToId:           defaultRelatedToId   ?? '',
      assignedToId:          undefined,
    },
  });

  // ── Populate when editing ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (task) {
      form.reset({
        title:                 task.title,
        description:           task.description ?? '',
        type:                  task.type,
        priority:              task.priority,
        reminderBeforeMinutes: task.reminderBeforeMinutes,
        dueDateTime: task.dueDateTime
          ? format(new Date(task.dueDateTime), "yyyy-MM-dd'T'HH:mm")
          : '',
        relatedToType: task.relatedToType ?? undefined,
        relatedToId:   task.relatedToId   ?? '',
        assignedToId:  task.assignedToId  ?? undefined,
      });
    } else {
      form.reset({
        title: '', description: '', type: 'TASK', priority: 'MEDIUM',
        reminderBeforeMinutes: 30, dueDateTime: '',
        relatedToType: defaultRelatedToType ?? undefined,
        relatedToId:   defaultRelatedToId   ?? '',
        assignedToId:  undefined,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, open]);

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit = async (values: FormValues) => {
    const payload = {
      title:                 values.title,
      description:           values.description || undefined,
      type:                  values.type,
      priority:              values.priority,
      dueDateTime:           new Date(values.dueDateTime).toISOString(),
      reminderBeforeMinutes: Number(values.reminderBeforeMinutes),
      relatedToType:         values.relatedToType || undefined,
      relatedToId:           values.relatedToId   || undefined,
      assignedToId:
        values.assignedToId && values.assignedToId !== 'UNASSIGNED'
          ? values.assignedToId
          : undefined,
    };
    try {
      if (isEdit) { await update.mutateAsync(payload); }
      else        { await create.mutateAsync(payload); }
      onClose();
    } catch {
      // toast handled in hooks
    }
  };

  const isPending            = create.isPending || update.isPending;
  const watchedType          = form.watch('type');
  const watchedRelatedToType = form.watch('relatedToType');

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <CalendarClock className="h-4 w-4 text-primary-foreground" />
            </div>
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-5 space-y-5">

            {/* ── Title ─────────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Call client regarding itinerary" autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Type + Priority ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            <span className="flex items-center gap-2">
                              <span>{t.emoji}</span><span>{t.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <Badge variant="outline" className={p.cls}>{p.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ── Due DateTime ──────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="dueDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Due Date & Time <span className="text-red-500">*</span>
                    {watchedType === 'MEETING' && (
                      <Badge variant="outline" className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200">
                        Required for meetings
                      </Badge>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" min={getMinDateTime()} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Reminder ──────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="reminderBeforeMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <AlarmClock className="h-3.5 w-3.5 text-amber-500" />
                    Send Reminder
                    {watchedType === 'MEETING' && (
                      <span className="text-red-500 text-xs">(required)</span>
                    )}
                  </FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(Number(v))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Assign To ────────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-500" />
                    Assign To
                    <span className="text-muted-foreground text-xs font-normal">(optional)</span>
                  </FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === 'UNASSIGNED' ? undefined : v)}
                    value={field.value && field.value !== '' ? field.value : 'UNASSIGNED'}
                    disabled={usersLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        {usersLoading ? (
                          <span className="text-muted-foreground text-sm flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading employees...
                          </span>
                        ) : (
                          <SelectValue placeholder="Select employee" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNASSIGNED">
                        <span className="text-muted-foreground italic">Unassigned</span>
                      </SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5 shrink-0">
                              <AvatarFallback className="text-[9px] bg-blue-100 text-blue-700 font-bold">
                                {u.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{u.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              · {u.role.toLowerCase()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Related Entity ────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="relatedToType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Related To
                      <span className="text-muted-foreground text-xs font-normal ml-1">(optional)</span>
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v === 'NONE' ? undefined : v);
                        if (v === 'NONE') form.setValue('relatedToId', '');
                      }}
                      value={field.value ?? 'NONE'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NONE">
                          <span className="text-muted-foreground italic">None</span>
                        </SelectItem>
                        <SelectItem value="LEAD">👤 Lead</SelectItem>
                        <SelectItem value="CUSTOMER">👥 Customer</SelectItem>
                        <SelectItem value="BOOKING">✈️ Booking</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relatedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={watchedRelatedToType ? 'Paste ID here' : 'Select type first'}
                        disabled={!watchedRelatedToType}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* ── Description ───────────────────────────────────────── */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description
                    <span className="text-muted-foreground text-xs font-normal ml-1">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes, context or details..."
                      rows={3}
                      className="resize-none"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ── Footer ────────────────────────────────────────────── */}
            <DialogFooter className="pt-3 gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 sm:flex-none min-w-[130px]"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}