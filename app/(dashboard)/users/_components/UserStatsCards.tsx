'use client';

import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserStats } from '@/types/users';

interface Props {
  stats: UserStats;
}

export function UserStatsCards({ stats }: Props) {
  const cards = [
    {
      label: 'Total Users',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Users',
      value: stats.active,
      icon: UserCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Inactive Users',
      value: stats.inactive,
      icon: UserX,
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Active This Week',
      value: stats.activeInLast7Days,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}