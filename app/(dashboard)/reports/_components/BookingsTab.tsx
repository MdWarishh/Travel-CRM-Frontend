'use client';
// app/(dashboard)/reports/_components/BookingsTab.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Calendar, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  StatusBadge, ExportCsvBtn, exportToCSV, CHART_COLORS, TabSkeleton,
} from './ReportUtils';

interface Props { params: Record<string, string> }

const STATUS_FILTERS = ['', 'CONFIRMED', 'COMPLETED', 'PENDING', 'CANCELLED'] as const;

export function BookingsTab({ params }: Props) {
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'bookings', { ...params, status: statusFilter }],
    queryFn:  () => reportsService.getBookingReport({
      ...params,
      ...(statusFilter && { status: statusFilter }),
    }),
  });

  if (isLoading || isFetching) return <TabSkeleton cards={3} rows={2} />;
  if (!data) return <ReportEmpty label="No booking data" />;

  // ── Derived ────────────────────────────────────────────────────────────────
  const completed = data.byStatus?.find((b) => b.status === 'COMPLETED')?.count ?? 0;
  const cancelled = data.byStatus?.find((b) => b.status === 'CANCELLED')?.count ?? 0;

  const statusChartData = (data.byStatus ?? []).map((b) => ({
    name:  b.status,
    value: b.count,
  }));

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s || 'All Statuses'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard
          label="Total Bookings" value={data.total}
          icon={<Calendar className="w-4 h-4" />} color="blue"
        />
        <ReportStatCard
          label="Total Revenue" value={formatCurrency(data.totalRevenue)}
          icon={<DollarSign className="w-4 h-4" />} color="green"
        />
        <ReportStatCard
          label="Completed" value={completed}
          icon={<BarChart3 className="w-4 h-4" />} color="teal"
        />
        <ReportStatCard
          label="Cancelled" value={cancelled}
          icon={<BarChart3 className="w-4 h-4" />} color="red"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Pie */}
        <ReportCard title="Bookings by Status">
          {statusChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusChartData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85} innerRadius={50}
                >
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        {/* Status Bar */}
        <ReportCard title="Status Count Comparison">
          {statusChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Bookings Table */}
      {data.bookings?.length > 0 && (
        <ReportCard
          title={`Recent Bookings (${data.bookings.length})`}
          noPad
          action={
            <ExportCsvBtn onClick={() => exportToCSV('bookings',
              data.bookings.map((b) => ({
                Customer:    b.customer?.name   ?? '',
                Itinerary:   b.itinerary?.title ?? '',
                Destination: b.itinerary?.destination ?? '',
                Status:      b.status,
                Amount:      b.totalAmount ?? 0,
              }))
            )} />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  {['Customer', 'Itinerary', 'Destination', 'Status', 'Amount'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.bookings.slice(0, 25).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-800">{b.customer?.name  ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-[180px] truncate">{b.itinerary?.title ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{b.itinerary?.destination ?? '—'}</td>
                    <td className="px-5 py-3"><StatusBadge label={b.status} /></td>
                    <td className="px-5 py-3 font-semibold text-teal-600">
                      {b.totalAmount ? formatCurrency(b.totalAmount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}
    </div>
  );
}