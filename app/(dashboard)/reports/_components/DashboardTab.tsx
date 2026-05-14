'use client';

// app/(dashboard)/reports/_components/DashboardTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, Users, Calendar,
  ShoppingBag, Percent, TrendingDown, UserCheck,
} from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { ReportStatCard, ReportCard, ReportEmpty } from './ReportUtils';

interface Props {
  params: Record<string, string>;
}

export function DashboardTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'dashboard', params],
    queryFn: () => reportsService.getDashboard(params),
  });

  if (isLoading || isFetching) return <DashboardSkeleton />;
  if (!data) return <ReportEmpty label="No dashboard data" />;

  const { kpis, charts } = data;

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <ReportStatCard label="Total Revenue"     value={formatCurrency(kpis.totalRevenue)}  icon={<DollarSign className="w-4 h-4"/>}  color="blue"   />
        <ReportStatCard label="Gross Profit"      value={formatCurrency(kpis.totalProfit)}   icon={<TrendingUp  className="w-4 h-4"/>}  color="green"  sub={`Margin ${Number(kpis.netProfitMargin).toFixed(1)}%`} />
        <ReportStatCard label="Total Expenses"    value={formatCurrency(kpis.totalExpenses)} icon={<TrendingDown className="w-4 h-4"/>} color="red"    />
        <ReportStatCard label="Conversion Rate"   value={`${Number(kpis.conversionRate).toFixed(1)}%`} icon={<Percent className="w-4 h-4"/>} color="purple" />
        <ReportStatCard label="Total Bookings"    value={kpis.totalBookings}  icon={<Calendar className="w-4 h-4"/>}    color="teal"   sub={`${kpis.completedBookings} completed`} />
        <ReportStatCard label="Total Leads"       value={kpis.totalLeads}     icon={<ShoppingBag className="w-4 h-4"/>} color="indigo" sub={`${kpis.convertedLeads} converted`} />
        <ReportStatCard label="Total Customers"   value={kpis.totalCustomers} icon={<Users className="w-4 h-4"/>}       color="pink"   />
        <ReportStatCard label="Cancelled Bookings" value={kpis.cancelledBookings} icon={<UserCheck className="w-4 h-4"/>} color="amber" />
      </div>

      {/* Revenue Trend */}
      <ReportCard title="Monthly Revenue Trend">
        {charts.monthlyRevenue?.length ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={charts.monthlyRevenue} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <ReportEmpty />}
      </ReportCard>

      {/* Profit vs Expense + Leads vs Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard title="Profit vs Expense">
          {charts.profitVsExpense?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.profitVsExpense} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit"  name="Profit"  fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        <ReportCard title="Leads vs Conversions">
          {charts.leadsVsConversion?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.leadsVsConversion} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="leads"     name="Leads"     fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="converted" name="Converted" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-56 bg-slate-100 rounded-2xl" />
        <div className="h-56 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}