'use client';
// app/(dashboard)/reports/_components/PaymentsTab.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { CreditCard, CheckCircle2, Clock, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  StatusBadge, ExportCsvBtn, exportToCSV, CHART_COLORS, TabSkeleton,
} from './ReportUtils';

interface Props { params: Record<string, string> }

const MODE_FILTERS = ['', 'CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE'] as const;

export function PaymentsTab({ params }: Props) {
  const [modeFilter, setModeFilter] = useState('');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'payments', { ...params, mode: modeFilter }],
    queryFn:  () => reportsService.getPaymentReport({
      ...params,
      ...(modeFilter && { mode: modeFilter }),
    }),
  });

  if (isLoading || isFetching) return <TabSkeleton cards={4} rows={2} />;
  if (!data) return <ReportEmpty label="No payment data" />;

  // ── Derived ────────────────────────────────────────────────────────────────
  const collectionRate = data.totalAmount > 0
    ? ((data.totalCollected / data.totalAmount) * 100).toFixed(1)
    : '0.0';

  const modeChartData   = (data.byMode   ?? []).map((m) => ({ name: m.mode,   value: m.collected ?? 0 }));
  const statusChartData = (data.byStatus ?? []).map((s) => ({ name: s.status, value: s.amount   ?? 0 }));

  return (
    <div className="space-y-4">
      {/* Mode filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {MODE_FILTERS.map((m) => (
          <button
            key={m}
            onClick={() => setModeFilter(m)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
              modeFilter === m
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {m || 'All Modes'}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard
          label="Total Amount" value={formatCurrency(data.totalAmount)}
          icon={<CreditCard className="w-4 h-4" />} color="blue"
        />
        <ReportStatCard
          label="Collected" value={formatCurrency(data.totalCollected)}
          icon={<CheckCircle2 className="w-4 h-4" />} color="green"
          sub={`${collectionRate}% rate`}
        />
        <ReportStatCard
          label="Pending Due" value={formatCurrency(data.totalDue)}
          icon={<Clock className="w-4 h-4" />} color="red"
        />
        <ReportStatCard
          label="Transactions" value={data.total}
          icon={<BarChart3 className="w-4 h-4" />} color="purple"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mode Pie */}
        <ReportCard title="Revenue by Payment Mode">
          {modeChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={modeChartData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85} innerRadius={50}
                >
                  {modeChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        {/* Status Bar */}
        <ReportCard title="Amount by Payment Status">
          {statusChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={statusChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="value" name="Amount" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Collection summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Billed',     value: data.totalAmount,    color: 'border-l-blue-400',    textCls: 'text-blue-700' },
          { label: 'Amount Collected', value: data.totalCollected, color: 'border-l-emerald-400', textCls: 'text-emerald-700' },
          { label: 'Amount Pending',   value: data.totalDue,       color: 'border-l-red-400',     textCls: 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${item.color} p-4 shadow-sm`}>
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.textCls}`}>{formatCurrency(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Detailed status table */}
      {data.byStatus?.length > 0 && (
        <ReportCard
          title="Payment Status Details"
          noPad
          action={
            <ExportCsvBtn onClick={() => exportToCSV('payments-by-status',
              data.byStatus.map((s) => ({ Status: s.status, Count: s.count, Amount: s.amount }))
            )} />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  {['Status', 'Transactions', 'Total Amount'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.byStatus.map((s) => (
                  <tr key={s.status} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3"><StatusBadge label={s.status} /></td>
                    <td className="px-5 py-3 font-medium text-slate-700">{s.count}</td>
                    <td className="px-5 py-3 font-bold text-amber-600">{formatCurrency(s.amount)}</td>
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