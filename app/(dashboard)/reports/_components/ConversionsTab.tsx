'use client';
// app/(dashboard)/reports/_components/ConversionsTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, CheckCircle2, XCircle, Percent } from 'lucide-react';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  ExportCsvBtn, exportToCSV, TabSkeleton,
} from './ReportUtils';
import { ConversionReport } from '@/types/reports.types';

interface Props { params: Record<string, string> }

export function ConversionsTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'conversions', params],
    queryFn:  () => reportsService.getConversionReport(params),
  });

  if (isLoading || isFetching) return <TabSkeleton cards={4} rows={2} />;
if (!data) return <ReportEmpty label="No conversion data" />;

// ✅ Ye add karo
const convData: ConversionReport = data;
  // ── Derived ────────────────────────────────────────────────────────────────
  const convRate = parseFloat(String(data.conversionRate)) || 0;
  const active   = Math.max(0, data.total - data.converted - data.lost);
  const lossRate = data.total > 0 ? ((data.lost / data.total) * 100) : 0;
  const activeRate = Math.max(0, 100 - convRate - lossRate);

  // Chart data for agent breakdown
  const agentChartData = (convData.byAgent ?? []).map((a) => ({
    name:      a.agentName.split(' ')[0], // first name only, avoid overflow
    Converted: a.converted,
    Lost:      a.lost,
    Active:    Math.max(0, (a.converted + a.lost) > 0 ? 0 : 0), // just show converted + lost
  }));

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Leads"     value={data.total}     icon={<TrendingUp   className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="Converted"       value={data.converted} icon={<CheckCircle2 className="w-4 h-4" />} color="green"  />
        <ReportStatCard label="Lost"            value={data.lost}      icon={<XCircle      className="w-4 h-4" />} color="red"    />
        <ReportStatCard
          label="Conversion Rate"
          value={`${convRate.toFixed(1)}%`}
          icon={<Percent className="w-4 h-4" />}
          color="purple"
          sub={`${active} active`}
        />
      </div>

      {/* Rate Bars + Funnel Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visual rate breakdown */}
        <ReportCard title="Conversion Overview">
          <div className="space-y-5 py-2">
            {[
              { label: 'Conversion Rate', value: convRate,   color: 'bg-emerald-500', text: 'text-emerald-600' },
              { label: 'Loss Rate',       value: lossRate,   color: 'bg-red-400',     text: 'text-red-600' },
              { label: 'Still Active',    value: activeRate, color: 'bg-amber-400',   text: 'text-amber-600' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
                  <span>{item.label}</span>
                  <span className={`font-bold ${item.text}`}>{item.value.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Summary numbers */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
              {[
                { label: 'Converted', count: data.converted, cls: 'text-emerald-600' },
                { label: 'Lost',      count: data.lost,      cls: 'text-red-500' },
                { label: 'Active',    count: active,         cls: 'text-amber-600' },
              ].map((item) => (
                <div key={item.label} className="text-center py-2 rounded-xl bg-slate-50">
                  <p className={`text-xl font-bold ${item.cls}`}>{item.count}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </ReportCard>

        {/* Stacked Bar — agent breakdown */}
        {agentChartData.length > 0 ? (
          <ReportCard title="Agent: Converted vs Lost">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agentChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Converted" fill="#10b981" radius={[0, 0, 0, 0]} stackId="a" />
                <Bar dataKey="Lost"      fill="#ef4444" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ReportCard>
        ) : (
          <ReportCard title="Agent Breakdown"><ReportEmpty /></ReportCard>
        )}
      </div>

      {/* Agent Table */}
      {data.byAgent?.length > 0 && (
        <ReportCard
          title="Agent-wise Conversion Stats"
          noPad
          action={
            <ExportCsvBtn onClick={() => exportToCSV('conversions-by-agent',
              convData.byAgent.map((a) => ({
                Agent:     a.agentName,
                Converted: a.converted,
                Lost:      a.lost,
              }))
            )} />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  {['Agent', 'Converted', 'Lost', 'Conv. Rate'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {convData.byAgent.map((a) => {
                  const agentTotal = a.converted + a.lost;
                  const rate = agentTotal > 0 ? ((a.converted / agentTotal) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={a.agentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-800">{a.agentName}</td>
                      <td className="px-5 py-3 text-emerald-600 font-bold">{a.converted}</td>
                      <td className="px-5 py-3 text-red-500">{a.lost}</td>
                      <td className="px-5 py-3 font-bold text-indigo-600">{rate}%</td>
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