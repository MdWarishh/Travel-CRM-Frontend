'use client';

// app/(dashboard)/reports/_components/VendorsTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Building2, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  ExportCsvBtn, exportToCSV, CHART_COLORS, ProgressBar,
} from './ReportUtils';

interface Props { params: Record<string, string> }

export function VendorsTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'vendors', params],
    queryFn: () => reportsService.getVendorReport(params),
  });

  if (isLoading || isFetching) return <VendSkeleton />;
  if (!data) return <ReportEmpty label="No vendor data" />;

  const { summary, byType, byCity, topVendors } = data;
  const maxRevenue = Math.max(...(topVendors?.map((v) => v.totalRevenue) ?? [1]));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <ReportStatCard label="Total Vendors"    value={summary.totalVendors}    icon={<Building2    className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="Active"           value={summary.activeVendors}   icon={<CheckCircle2 className="w-4 h-4" />} color="green"  />
        <ReportStatCard label="Inactive"         value={summary.inactiveVendors} icon={<XCircle      className="w-4 h-4" />} color="red"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Type Pie */}
        <ReportCard title="Vendors by Service Type">
          {byType?.length ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={byType.map((v) => ({ name: v.type, value: v.count }))}
                  dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={46}>
                  {byType.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        {/* City Bar */}
        <ReportCard title="Top Vendor Cities">
          {byCity?.length ? (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                layout="vertical"
                data={byCity.slice(0, 8).map((c) => ({ name: c.city, Vendors: c.count }))}
                margin={{ top: 4, right: 20, left: 60, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                <Tooltip />
                <Bar dataKey="Vendors" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Top Vendors Table */}
      {topVendors?.length > 0 && (
        <ReportCard
          title="Top Vendors by Usage"
          noPad
          action={<ExportCsvBtn onClick={() => exportToCSV('top-vendors', topVendors.map((v) => ({
            Vendor: v.vendorName, Type: v.serviceType, City: v.city, Bookings: v.usageCount, Revenue: v.totalRevenue,
          })))} />}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  {['Vendor', 'Type', 'City', 'Bookings', 'Revenue', 'Share'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topVendors.map((v, idx) => (
                  <tr key={v.vendorId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                        <span className="font-medium text-slate-800">{v.vendorName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{v.serviceType}</td>
                    <td className="px-5 py-3 text-slate-500">{v.city || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-indigo-600">{v.usageCount}</td>
                    <td className="px-5 py-3 font-semibold text-teal-600">{formatCurrency(v.totalRevenue)}</td>
                    <td className="px-5 py-3 w-28">
                      <ProgressBar value={v.totalRevenue} max={maxRevenue} color="blue" />
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

function VendSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
      <div className="grid grid-cols-2 gap-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-56 bg-slate-100 rounded-2xl" />)}</div>
    </div>
  );
}