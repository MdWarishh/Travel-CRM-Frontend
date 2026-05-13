'use client';

// app/(dashboard)/reports/_components/FlightMatchingTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plane, CheckCircle2, XCircle, Clock, Target, Percent, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { ReportStatCard, ReportCard, ReportEmpty, CHART_COLORS, StatusBadge } from './ReportUtils';

interface Props { params: Record<string, string> }

export function FlightMatchingTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'flight-matching', params],
    queryFn: () => reportsService.getFlightMatchingReport(params),
  });

  if (isLoading || isFetching) return <FlightSkeleton />;
  if (!data) return <ReportEmpty label="No flight matching data" />;

  const { summary, byStatus } = data;

  return (
    <div className="space-y-4">
      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Listings"   value={summary.totalListings}  icon={<Plane        className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="Total Buyers"     value={summary.totalBuyers}    icon={<Target       className="w-4 h-4" />} color="indigo" />
        <ReportStatCard label="Deals Created"    value={summary.totalDeals}     icon={<TrendingUp   className="w-4 h-4" />} color="purple" />
        <ReportStatCard label="Completed Deals"  value={summary.completedDeals} icon={<CheckCircle2 className="w-4 h-4" />} color="green"  />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Rejected"       value={summary.rejectedDeals}                    icon={<XCircle  className="w-4 h-4" />} color="red"    />
        <ReportStatCard label="Pending"        value={summary.pendingDeals}                     icon={<Clock    className="w-4 h-4" />} color="amber"  />
        <ReportStatCard label="Match Rate"     value={`${Number(summary.matchRate).toFixed(1)}%`}      icon={<Percent  className="w-4 h-4" />} color="teal"   />
        <ReportStatCard label="Completion Rate" value={`${Number(summary.completionRate).toFixed(1)}%`} icon={<Percent  className="w-4 h-4" />} color="orange" />
      </div>

      {/* Financials + Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* P&L Summary */}
        <ReportCard title="Financial Summary">
          <div className="space-y-3 py-1">
            {[
              { label: 'Total Revenue', value: formatCurrency(summary.totalRevenue), color: 'text-blue-600',    bar: 'bg-blue-400',    pct: 100 },
              { label: 'Total Cost',    value: formatCurrency(summary.totalCost),    color: 'text-amber-600',   bar: 'bg-amber-400',   pct: summary.totalRevenue > 0 ? (summary.totalCost / summary.totalRevenue) * 100 : 0 },
              { label: 'Gross Profit',  value: formatCurrency(summary.grossProfit),  color: 'text-emerald-600', bar: 'bg-emerald-400', pct: summary.totalRevenue > 0 ? (summary.grossProfit / summary.totalRevenue) * 100 : 0 },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.bar} transition-all duration-700`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </ReportCard>

        {/* Status Pie */}
        <ReportCard title="Deals by Status">
          {byStatus?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={byStatus.map((d) => ({ name: d.status, value: d.count }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50}>
                  {byStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Status breakdown cards */}
      {byStatus?.length > 0 && (
        <ReportCard title="Deal Status Overview">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {byStatus.map((d, i) => (
              <div key={d.status} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-center">
                <StatusBadge label={d.status} />
                <p className="text-3xl font-bold text-slate-800 mt-2">{d.count}</p>
              </div>
            ))}
          </div>
        </ReportCard>
      )}
    </div>
  );
}

function FlightSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-60 bg-slate-100 rounded-2xl" />)}</div>
    </div>
  );
}