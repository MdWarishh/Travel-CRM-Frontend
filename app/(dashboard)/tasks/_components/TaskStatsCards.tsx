'use client';

import { Calendar, Clock, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useTaskStats } from '@/hooks/useTasks';

// ─── Stat card config ─────────────────────────────────────────────────────────
const STAT_CONFIG = [
  {
    key:     'today' as const,
    label:   "Today's Tasks",
    icon:    Calendar,
    color:   'text-amber-600',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    ring:    'ring-amber-100',
  },
  {
    key:     'upcoming' as const,
    label:   'Upcoming',
    icon:    TrendingUp,
    color:   'text-blue-600',
    bg:      'bg-blue-50',
    border:  'border-blue-200',
    ring:    'ring-blue-100',
  },
  {
    key:     'overdue' as const,
    label:   'Overdue',
    icon:    AlertTriangle,
    color:   'text-red-600',
    bg:      'bg-red-50',
    border:  'border-red-200',
    ring:    'ring-red-100',
  },
  {
    key:     'completed' as const,
    label:   'Completed',
    icon:    CheckCircle2,
    color:   'text-green-600',
    bg:      'bg-green-50',
    border:  'border-green-200',
    ring:    'ring-green-100',
  },
];

interface TaskStatsCardsProps {
  onFilterSelect?: (filter: 'today' | 'upcoming' | 'overdue' | 'completed') => void;
}

export default function TaskStatsCards({ onFilterSelect }: TaskStatsCardsProps) {
  const { data, isLoading } = useTaskStats();
  const counts = data?.data?.counts;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border">
            <CardContent className="p-4">
              <Skeleton className="h-8 w-8 rounded-lg mb-3" />
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STAT_CONFIG.map((stat) => {
        const Icon  = stat.icon;
        const count = counts?.[stat.key] ?? 0;
        const isAlert = stat.key === 'overdue' && count > 0;

        return (
          <Card
            key={stat.key}
            onClick={() => onFilterSelect?.(stat.key)}
            className={cn(
              'border cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:-translate-y-0.5',
              isAlert && 'border-red-300 animate-pulse-slow',
            )}
          >
            <CardContent className="p-4">
              <div className={cn(
                'h-9 w-9 rounded-lg flex items-center justify-center mb-3',
                stat.bg, stat.border, 'border',
              )}>
                <Icon className={cn('h-4.5 w-4.5', stat.color)} />
              </div>
              <div className={cn('text-2xl font-bold tabular-nums', stat.color)}>
                {count}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {stat.label}
              </p>
              {isAlert && (
                <p className="text-[10px] text-red-500 mt-1 font-medium">
                  Needs attention
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}