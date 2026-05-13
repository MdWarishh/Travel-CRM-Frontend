'use client';
// app/(dashboard)/reports/_components/LeadsTab.tsx

import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  ExportCsvBtn, exportToCSV, CHART_COLORS, ProgressBar, TabSkeleton,
} from './ReportUtils';

interface Props { params: Record<string, string> }

export function LeadsTab({ params }: Props) {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'leads', params],
    queryFn:  () => reportsService.getLeadReport(params),
  });

  if (isLoading || isFetching) return <TabSkeleton cards={4} rows={2} />;
  if (!data) return <ReportEmpty label="No lead data" />;

  // ── Derived values ─────────────────────────────────────────────────────────
  const hotLeads  = data.byPriority?.find((p) => p.priority === 'HOT')?.count  ?? 0;
  const warmLeads = data.byPriority?.find((p) => p.priority === 'WARM')?.count ?? 0;
  const coldLeads = data.byPriority?.find((p) => p.priority === 'COLD')?.count ?? 0;

  const maxAgentCount = Math.max(...(data.byAgent?.map((a) => a.count) ?? [1]), 1);

  // byStatus from backend has stageId (not name) — display as is
  const statusChartData = (data.byStatus ?? [])
    .filter((s) => s.stageId)
    .map((s) => ({ name: s.stageId ?? 'Unknown', value: s.count }));

  const sourceChartData = (data.bySource ?? []).map((s) => ({
    name: s.source,
    value: s.count,
  }));

  const priorityChartData = (data.byPriority ?? []).map((p) => ({
    name: p.priority,
    value: p.count,
    fill: p.priority === 'HOT' ? '#ef4444' : p.priority === 'WARM' ? '#f59e0b' : '#3b82f6',
  }));

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard
          label="Total Leads" value={data.total}
          icon={<TrendingUp className="w-4 h-4" />} color="blue"
        />
        <ReportStatCard
          label="Hot Leads" value={hotLeads}
          icon={<AlertCircle className="w-4 h-4" />} color="red"
        />
        <ReportStatCard
          label="Warm Leads" value={warmLeads}
          icon={<TrendingUp className="w-4 h-4" />} color="amber"
        />
        <ReportStatCard
          label="Cold Leads" value={coldLeads}
          icon={<Users className="w-4 h-4" />} color="blue"
          sub={`${data.bySource?.length ?? 0} sources`}
        />
      </div>

      {/* Source Pie + Priority Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportCard title="Leads by Source">
          {sourceChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={sourceChartData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={85} innerRadius={50}
                >
                  {sourceChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>

        <ReportCard title="Leads by Priority">
          {priorityChartData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={priorityChartData}
                margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Leads" radius={[5, 5, 0, 0]}>
                  {priorityChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <ReportEmpty />}
        </ReportCard>
      </div>

      {/* Stage-wise breakdown */}
      {statusChartData.length > 0 && (
        <ReportCard title="Leads by Stage">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={statusChartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      )}

      {/* Agent Table */}
      {data.byAgent?.length > 0 && (
        <ReportCard
          title="Leads by Agent"
          noPad
          action={
            <ExportCsvBtn onClick={() => exportToCSV('leads-by-agent',
              data.byAgent.map((a) => ({ Agent: a.agentName, 'Lead Count': a.count }))
            )} />
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                  <th className="px-5 py-3 text-left font-semibold">#</th>
                  <th className="px-5 py-3 text-left font-semibold">Agent</th>
                  <th className="px-5 py-3 text-right font-semibold">Leads</th>
                  <th className="px-5 py-3 text-left font-semibold w-40">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.byAgent.map((a, idx) => (
                  <tr key={a.agentId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">{a.agentName}</td>
                    <td className="px-5 py-3 text-right font-bold text-indigo-600">{a.count}</td>
                    <td className="px-5 py-3">
                      <ProgressBar value={a.count} max={maxAgentCount} color="blue" />
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