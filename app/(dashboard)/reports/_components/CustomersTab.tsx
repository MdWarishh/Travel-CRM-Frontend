'use client';

// app/(dashboard)/reports/_components/CustomersTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { Users, UserPlus, RefreshCw, Heart } from 'lucide-react';
import { ReportStatCard, ReportCard, ReportEmpty } from './ReportUtils';

interface Props { params: Record<string, string> }

export function CustomersTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'customers', params],
    queryFn: () => reportsService.getCustomerReport(params),
  });

  if (isLoading || isFetching) return <CustSkeleton />;
  if (!data) return <ReportEmpty label="No customer data" />;

  const { summary, byCity, monthlyTrend } = data;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Customers"   value={summary.total}            icon={<Users      className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="New This Period"    value={summary.newThisPeriod}    icon={<UserPlus   className="w-4 h-4" />} color="green"  />
        <ReportStatCard label="Repeat Customers"  value={summary.repeatCustomers}  icon={<RefreshCw  className="w-4 h-4" />} color="purple" />
        <ReportStatCard label="Retention Rate"    value={`${Number(summary.retentionRate).toFixed(1)}%`} icon={<Heart className="w-4 h-4" />} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Cities */}
        <ReportCard title="Customers by City">
          {byCity?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={byCity.slice(0, 10).map((c) => ({ name: c.city, Customers: c.count }))}
                margin={{ top: 4, right: 20, left: 60, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                <Tooltip />
                <Bar dataKey="Customers" fill="#ec4899" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        {/* Growth Trend */}
        <ReportCard title="Customer Growth Trend">
          {monthlyTrend?.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={monthlyTrend.map((m) => ({ name: m.month, Customers: m.total }))}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ec4899" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Customers" stroke="#ec4899" strokeWidth={2} fill="url(#custGrad)" dot={{ r: 3, fill: '#ec4899' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Retention insight card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'New Customers',    value: summary.newThisPeriod,   sub: 'Acquired this period', color: 'border-l-blue-400' },
          { label: 'Repeat Customers', value: summary.repeatCustomers, sub: 'Came back again',      color: 'border-l-purple-400' },
          { label: 'One-time',         value: Math.max(0, summary.total - summary.repeatCustomers), sub: 'Single booking only', color: 'border-l-slate-300' },
        ].map((item) => (
          <div key={item.label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${item.color} p-4 shadow-sm`}>
            <p className="text-xs text-slate-500 font-medium">{item.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{item.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-60 bg-slate-100 rounded-2xl" />)}</div>
    </div>
  );
}