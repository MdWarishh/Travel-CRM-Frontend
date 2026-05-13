'use client';

import { format, isToday, isPast } from 'date-fns';
import { CalendarClock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Button }   from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTaskStats } from '@/hooks/useTasks';
import type { Task } from '@/types/task.types';

// ─── Mini task row ────────────────────────────────────────────────────────────
function MiniTaskRow({ task }: { task: Task }) {
  const due       = new Date(task.dueDateTime);
  const isOverdue = isPast(due) && task.status === 'PENDING';
  const isDueToday = isToday(due);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={cn(
        'h-2 w-2 rounded-full shrink-0',
        task.priority === 'HIGH'   ? 'bg-red-500'   :
        task.priority === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-300',
      )} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className={cn(
          'text-xs',
          isOverdue   ? 'text-red-500 font-medium' :
          isDueToday  ? 'text-amber-600' : 'text-muted-foreground',
        )}>
          {isOverdue
            ? `Overdue · ${format(due, 'MMM d, h:mm a')}`
            : isDueToday
              ? `Today · ${format(due, 'h:mm a')}`
              : format(due, 'MMM d, h:mm a')
          }
        </p>
      </div>
      <Badge variant="outline" className="shrink-0 text-[10px] px-1.5">
        {task.type.replace('_', ' ')}
      </Badge>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UpcomingTasksSidebar() {
  const { data, isLoading } = useTaskStats();
  const stats = data?.data;

  return (
    <div className="space-y-4">
      {/* Overdue section */}
      {(isLoading || (stats?.overdueTasks && stats.overdueTasks.length > 0)) && (
        <Card className="border-red-200 bg-red-50/40">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue Tasks
              {stats?.counts.overdue ? (
                <Badge className="ml-auto bg-red-600 text-white text-xs">
                  {stats.counts.overdue}
                </Badge>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div className="divide-y divide-red-100">
                {stats?.overdueTasks.slice(0, 4).map((task) => (
                  <MiniTaskRow key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's tasks */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            Today's Tasks
            {stats?.counts.today ? (
              <Badge variant="secondary" className="ml-auto text-xs">
                {stats.counts.today}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !stats?.todayTasks.length ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">All clear!</p>
              <p className="text-xs text-muted-foreground">No tasks due today</p>
            </div>
          ) : (
            <div className="divide-y">
              {stats.todayTasks.slice(0, 5).map((task) => (
                <MiniTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            Upcoming Tasks
            {stats?.counts.upcoming ? (
              <Badge variant="secondary" className="ml-auto text-xs">
                {stats.counts.upcoming}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : !stats?.upcomingTasks.length ? (
            <p className="text-xs text-muted-foreground text-center py-4">No upcoming tasks</p>
          ) : (
            <div className="divide-y">
              {stats.upcomingTasks.slice(0, 5).map((task) => (
                <MiniTaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View all link */}
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/tasks">
          View All Tasks <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}