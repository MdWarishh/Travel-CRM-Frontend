'use client';

import { format } from 'date-fns';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Badge }   from '@/components/ui/badge';
import { Button }  from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CheckCircle2, Circle, Pencil, AlarmClock, Calendar,
  Briefcase, Users, Plane, CalendarClock, Phone, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateTaskStatus } from '@/hooks/useTasks';
import type { Task, TaskType, TaskPriority, TaskStatus } from '@/types/task.types';

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<TaskType, { icon: React.ElementType; label: string; color: string }> = {
  TASK:      { icon: Briefcase,     label: 'Task',      color: 'text-blue-600 bg-blue-50 border-blue-200'   },
  MEETING:   { icon: CalendarClock, label: 'Meeting',   color: 'text-purple-600 bg-purple-50 border-purple-200' },
  FOLLOW_UP: { icon: Phone,         label: 'Follow-up', color: 'text-green-600 bg-green-50 border-green-200' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  LOW:    { label: 'Low',    color: 'bg-slate-100 text-slate-700 border-slate-200' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  HIGH:   { label: 'High',   color: 'bg-red-50 text-red-700 border-red-200'       },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  PENDING:   { label: 'Pending',   color: 'bg-slate-100 text-slate-700'  },
  COMPLETED: { label: 'Completed', color: 'bg-green-50 text-green-700'   },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-600'       },
};

// ─── Detail row component ─────────────────────────────────────────────────────
function DetailRow({ icon: Icon, label, children }: {
  icon: React.ElementType; label: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface TaskDetailSheetProps {
  task:    Task | null;
  open:    boolean;
  onClose: () => void;
  onEdit:  (task: Task) => void;
}

export default function TaskDetailSheet({ task, open, onClose, onEdit }: TaskDetailSheetProps) {
  const updateStatus = useUpdateTaskStatus();

  if (!task) return null;

  const typeConf   = TYPE_CONFIG[task.type];
  const prioConf   = PRIORITY_CONFIG[task.priority];
  const statusConf = STATUS_CONFIG[task.status];
  const TypeIcon   = typeConf.icon;

  const due      = new Date(task.dueDateTime);
  const reminder = new Date(task.reminderTime);
  const isDone   = task.status === 'COMPLETED';

  const handleToggle = () => {
    const next: TaskStatus = isDone ? 'PENDING' : 'COMPLETED';
    updateStatus.mutate({ id: task.id, status: next });
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className={cn('text-xs flex items-center gap-1', typeConf.color)}>
              <TypeIcon className="h-3 w-3" />
              {typeConf.label}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', prioConf.color)}>
              {prioConf.label} Priority
            </Badge>
          </div>
          <SheetTitle className={cn('text-xl font-bold leading-snug', isDone && 'line-through opacity-60')}>
            {task.title}
          </SheetTitle>
          <Badge className={cn('w-fit', statusConf.color)}>
            {statusConf.label}
          </Badge>
        </SheetHeader>

        <div className="space-y-5">
          {/* Description */}
          {task.description && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              {task.description}
            </div>
          )}

          <Separator />

          {/* Details */}
          <div className="space-y-4">
            <DetailRow icon={Calendar} label="Due Date & Time">
              {format(due, "EEEE, MMMM d, yyyy 'at' h:mm a")}
            </DetailRow>

            <DetailRow icon={AlarmClock} label="Reminder">
              <span>
                {task.reminderBeforeMinutes >= 60
                  ? `${task.reminderBeforeMinutes / 60} hour(s) before`
                  : `${task.reminderBeforeMinutes} minutes before`
                }
                {' '}
                <span className="text-muted-foreground font-normal">
                  ({format(reminder, 'MMM d, h:mm a')})
                </span>
                {task.reminderSent && (
                  <Badge className="ml-2 text-[10px] bg-green-100 text-green-700 border-0">
                    ✓ Sent
                  </Badge>
                )}
              </span>
            </DetailRow>

            {task.assignedTo && (
              <DetailRow icon={Users} label="Assigned To">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                      {task.assignedTo.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{task.assignedTo.name}</span>
                  <span className="text-xs text-muted-foreground">({task.assignedTo.role})</span>
                </div>
              </DetailRow>
            )}

            {task.relatedToType && (
              <DetailRow icon={Plane} label="Related To">
                <span className="capitalize">
                  {task.relatedToType.toLowerCase()} · {task.relatedToId?.slice(0, 8)}...
                </span>
              </DetailRow>
            )}

            {task.completedAt && (
              <DetailRow icon={CheckCircle2} label="Completed At">
                {format(new Date(task.completedAt), "MMM d, yyyy 'at' h:mm a")}
              </DetailRow>
            )}

            <DetailRow icon={Clock} label="Created">
              {format(new Date(task.createdAt), "MMM d, yyyy")}
              {task.createdBy && (
                <span className="text-muted-foreground font-normal"> by {task.createdBy.name}</span>
              )}
            </DetailRow>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            {task.status !== 'CANCELLED' && (
              <Button
                className="w-full"
                variant={isDone ? 'outline' : 'default'}
                onClick={handleToggle}
                disabled={updateStatus.isPending}
              >
                {isDone
                  ? <><Circle className="mr-2 h-4 w-4" /> Mark as Pending</>
                  : <><CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete</>
                }
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { onClose(); onEdit(task); }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}