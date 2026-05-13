'use client';

import { useState } from 'react';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import {
  MoreVertical, CheckCircle2, Circle, Clock, Calendar,
  Briefcase, Users, Plane, AlarmClock, Trash2, Pencil,
  Phone, CalendarClock,
} from 'lucide-react';
import { Card, CardContent }   from '@/components/ui/card';
import { Badge }               from '@/components/ui/badge';
import { Button }              from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn }                  from '@/lib/utils';
import { useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks';
import type { Task, TaskType, TaskPriority, TaskStatus } from '@/types/task.types';

// ─── Config maps ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<TaskType, { icon: React.ElementType; label: string; color: string }> = {
  TASK:      { icon: Briefcase,    label: 'Task',      color: 'text-blue-600 bg-blue-50 border-blue-200'   },
  MEETING:   { icon: CalendarClock, label: 'Meeting',  color: 'text-purple-600 bg-purple-50 border-purple-200' },
  FOLLOW_UP: { icon: Phone,        label: 'Follow-up', color: 'text-green-600 bg-green-50 border-green-200' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; dot: string; bar: string }> = {
  LOW:    { label: 'Low',    dot: 'bg-slate-400',  bar: 'bg-slate-300'  },
  MEDIUM: { label: 'Medium', dot: 'bg-amber-400',  bar: 'bg-amber-300'  },
  HIGH:   { label: 'High',   dot: 'bg-red-500',    bar: 'bg-red-400'    },
};

const RELATED_ICON: Record<string, React.ElementType> = {
  LEAD:     Users,
  CUSTOMER: Users,
  BOOKING:  Plane,
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pending',   className: 'bg-slate-100 text-slate-700 border-slate-200' },
  COMPLETED: { label: 'Completed', className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-50 text-red-600 border-red-200'       },
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskCardProps {
  task:    Task;
  onEdit:  (task: Task) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onEdit, compact = false }: TaskCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateStatus = useUpdateTaskStatus();
  const deleteTask   = useDeleteTask();

  const typeConf     = TYPE_CONFIG[task.type];
  const prioConf     = PRIORITY_CONFIG[task.priority];
  const statusConf   = STATUS_CONFIG[task.status];
  const TypeIcon     = typeConf.icon;
  const RelatedIcon  = task.relatedToType ? RELATED_ICON[task.relatedToType] : null;

  const due       = new Date(task.dueDateTime);
  const isOverdue = isPast(due) && task.status === 'PENDING';
  const isDueToday = isToday(due);
  const isDone    = task.status === 'COMPLETED';
  const isCancelled = task.status === 'CANCELLED';

  const handleToggleComplete = () => {
    const next: TaskStatus = isDone ? 'PENDING' : 'COMPLETED';
    updateStatus.mutate({ id: task.id, status: next });
  };

  const handleDelete = () => {
    deleteTask.mutate(task.id);
    setConfirmDelete(false);
  };

  return (
    <>
      <Card
        className={cn(
          'group relative border transition-all duration-200 hover:shadow-md',
          isDone && 'opacity-60',
          isOverdue && !isDone && 'border-red-200 bg-red-50/30',
          isDueToday && !isDone && !isOverdue && 'border-amber-200 bg-amber-50/20',
        )}
      >
        {/* Priority bar on left edge */}
        <div
          className={cn(
            'absolute left-0 top-3 bottom-3 w-0.5 rounded-full',
            prioConf.bar,
          )}
        />

        <CardContent className={cn('pl-4 pr-3', compact ? 'py-3' : 'py-4')}>
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={handleToggleComplete}
              disabled={isCancelled || updateStatus.isPending}
              className="mt-0.5 shrink-0 text-muted-foreground hover:text-green-600 transition-colors disabled:cursor-not-allowed"
            >
              {isDone
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <Circle className="h-5 w-5" />
              }
            </button>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className={cn('text-xs px-2 py-0.5 flex items-center gap-1', typeConf.color)}>
                  <TypeIcon className="h-3 w-3" />
                  {typeConf.label}
                </Badge>
                <Badge variant="outline" className={cn('text-xs', statusConf.className)}>
                  {statusConf.label}
                </Badge>
                <div className={cn('h-1.5 w-1.5 rounded-full', prioConf.dot)} title={`Priority: ${prioConf.label}`} />
                <span className="text-xs text-muted-foreground">{prioConf.label}</span>
              </div>

              {/* Title */}
              <p className={cn(
                'font-medium text-sm leading-tight truncate',
                isDone && 'line-through text-muted-foreground',
              )}>
                {task.title}
              </p>

              {/* Description */}
              {!compact && task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {task.description}
                </p>
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {/* Due time */}
                <span className={cn(
                  'flex items-center gap-1 text-xs',
                  isOverdue
                    ? 'text-red-600 font-medium'
                    : isDueToday
                      ? 'text-amber-600 font-medium'
                      : 'text-muted-foreground',
                )}>
                  {isOverdue
                    ? <Clock className="h-3 w-3" />
                    : <Calendar className="h-3 w-3" />
                  }
                  {isOverdue
                    ? `Overdue · ${formatDistanceToNow(due, { addSuffix: true })}`
                    : isDueToday
                      ? `Today · ${format(due, 'h:mm a')}`
                      : format(due, 'MMM d, h:mm a')
                  }
                </span>

                {/* Reminder */}
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <AlarmClock className="h-3 w-3" />
                  {task.reminderBeforeMinutes >= 60
                    ? `${task.reminderBeforeMinutes / 60}h before`
                    : `${task.reminderBeforeMinutes}m before`
                  }
                  {task.reminderSent && (
                    <span className="text-green-600 font-medium ml-0.5">· Sent</span>
                  )}
                </span>

                {/* Related entity */}
                {task.relatedToType && RelatedIcon && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RelatedIcon className="h-3 w-3" />
                    {task.relatedToType.charAt(0) + task.relatedToType.slice(1).toLowerCase()}
                  </span>
                )}
              </div>

              {/* Assignee */}
              {task.assignedTo && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                      {task.assignedTo.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                </div>
              )}
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {!isDone && !isCancelled && (
                  <DropdownMenuItem onClick={handleToggleComplete}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Mark Complete
                  </DropdownMenuItem>
                )}
                {task.status !== 'CANCELLED' && (
                  <DropdownMenuItem onClick={() =>
                    updateStatus.mutate({ id: task.id, status: 'CANCELLED' })
                  }>
                    <Circle className="mr-2 h-4 w-4 text-slate-400" /> Cancel Task
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{task.title}" will be permanently deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}