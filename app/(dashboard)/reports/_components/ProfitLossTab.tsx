'use client';

// app/(dashboard)/reports/_components/ProfitLossTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Percent } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { ReportStatCard, ReportCard, ReportEmpty, ExportCsvBtn, exportToCSV } from './ReportUtils';
import { ProfitLossReport } from '@/types/reports.types';

interface Props { params: Record<string, string> }

export function ProfitLossTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'profit-loss', params],
    queryFn: () => reportsService.getProfitLossReport(params),
  });

  if (isLoading || isFetching) return <PLSkeleton />;
  if (!data) return <ReportEmpty label="No P&L data" />;
  const { summary, monthlyPL } = data as ProfitLossReport;


  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Revenue"  value={formatCurrency(summary.totalRevenue)}  icon={<DollarSign   className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="Total Expenses" value={formatCurrency(summary.totalExpenses)} icon={<TrendingDown className="w-4 h-4" />} color="red"    />
        <ReportStatCard label="Gross Profit"   value={formatCurrency(summary.grossProfit)}   icon={<TrendingUp   className="w-4 h-4" />} color="green"  />
        <ReportStatCard label="Profit Margin"  value={`${Number(summary.profitMargin).toFixed(1)}%`} icon={<Percent className="w-4 h-4" />} color="purple" />
      </div>

      {/* Revenue breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Booking Revenue', value: formatCurrency(summary.bookingRevenue), color: 'border-l-blue-400' },
          { label: 'Flight Revenue',  value: formatCurrency(summary.flightRevenue),  color: 'border-l-indigo-400' },
          { label: 'Booking Expenses',value: formatCurrency(summary.bookingExpenses),color: 'border-l-amber-400' },
          { label: 'Flight Expenses', value: formatCurrency(summary.flightExpenses), color: 'border-l-red-400' },
        ].map((item) => (
          <div key={item.label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${item.color} p-4 shadow-sm`}>
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className="text-lg font-bold text-slate-800 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly P&L Chart */}
      <ReportCard title="Monthly Revenue vs Expense vs Profit">
        {monthlyPL?.length ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyPL.map((m) => ({ name: m.month, Revenue: m.revenue, Expense: m.expense, Profit: m.profit }))}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#e5e7eb" />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Expense" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Profit"  fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <ReportEmpty />}
      </ReportCard>

      {/* Monthly P&L Table */}
      {monthlyPL?.length > 0 && (
        <ReportCard
          title="Monthly Breakdown"
          noPad
          action={<ExportCsvBtn onClick={() => exportToCSV('profit-loss', monthlyPL.map((m) => ({
            Month: m.month, Revenue: m.revenue, Expense: m.expense, Profit: m.profit,
          })))} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  {['Month', 'Revenue', 'Expense', 'Profit / Loss', 'Margin'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthlyPL.map((m) => {
                  const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : '0.0';
                  const isPositive = m.profit >= 0;
                  return (
                    <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-700">{m.month}</td>
                      <td className="px-5 py-3 text-blue-600 font-semibold">{formatCurrency(m.revenue)}</td>
                      <td className="px-5 py-3 text-amber-600">{formatCurrency(m.expense)}</td>
                      <td className={`px-5 py-3 font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{formatCurrency(m.profit)}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportCard>
      )}
    </div>
  );
}

function PLSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}</div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  );
}