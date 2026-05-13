'use client';

// app/(dashboard)/vendors/_components/VendorStatsBar.tsx

import { useQuery } from '@tanstack/react-query';
import { Building2, Star, ShieldX, CheckCircle2, Loader2 } from 'lucide-react';
import { vendorsService } from '@/services';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}

function StatCard({ icon: Icon, label, value, iconColor, iconBg, loading }: StatCardProps) {
  return (
    <div className="flex items-center gap-3.5 bg-white rounded-xl border border-slate-100 px-5 py-4 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-6 w-10 bg-slate-100 animate-pulse rounded" />
        ) : (
          <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        )}
      </div>
    </div>
  );
}

export function VendorStatsBar() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendors', 'stats'],
    queryFn: vendorsService.getStats,
    staleTime: 60_000,
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={Building2}
        label="Total Vendors"
        value={stats?.total ?? 0}
        iconColor="text-slate-600"
        iconBg="bg-slate-100"
        loading={isLoading}
      />
      <StatCard
        icon={CheckCircle2}
        label="Active"
        value={stats?.active ?? 0}
        iconColor="text-emerald-600"
        iconBg="bg-emerald-50"
        loading={isLoading}
      />
      <StatCard
        icon={Star}
        label="Preferred"
        value={stats?.preferred ?? 0}
        iconColor="text-amber-500"
        iconBg="bg-amber-50"
        loading={isLoading}
      />
      <StatCard
        icon={ShieldX}
        label="Blacklisted"
        value={stats?.blacklisted ?? 0}
        iconColor="text-red-500"
        iconBg="bg-red-50"
        loading={isLoading}
      />
    </div>
  );
}