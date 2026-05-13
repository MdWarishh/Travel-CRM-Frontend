'use client';
// app/(dashboard)/reports/_components/AgentsTab.tsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/index';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Users, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  ReportStatCard, ReportCard, ReportEmpty,
  StatusBadge, ExportCsvBtn, exportToCSV, ProgressBar, TabSkeleton,
} from './ReportUtils';
import { AgentPerformance } from '@/types/reports.types';

interface Props { params: Record<string, string> }

type SortKey = 'converted' | 'totalLeads' | 'conversionRate' | 'pendingFollowUps';

export function AgentsTab({ params }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('converted');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report', 'agents', params],
    queryFn:  () => reportsService.getAgentPerformance(params),
  });

  if (isLoading || isFetching) return <TabSkeleton cards={4} rows={3} />;
  if (!data?.length) return <ReportEmpty label="No agent data" />;

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = [...data].sort((a, b) => {
    const av = parseFloat(String(a[sortKey])) || 0;
    const bv = parseFloat(String(b[sortKey])) || 0;
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  // ── Team totals ────────────────────────────────────────────────────────────
  const totalLeads     = data.reduce((s, a) => s + (a.totalLeads  || 0), 0);
  const totalConverted = data.reduce((s, a) => s + (a.converted   || 0), 0);
  const teamRate       = totalLeads > 0 ? ((totalConverted / totalLeads) * 100).toFixed(1) : '0.0';
  const maxConverted   = Math.max(...data.map((a) => a.converted || 0), 1);

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'desc'
        ? <ChevronDown className="w-3 h-3 inline ml-0.5" />
        : <ChevronUp   className="w-3 h-3 inline ml-0.5" />
      : null;

  // Chart data — top 8 agents
  const chartData = sorted.slice(0, 8).map((a) => ({
    name:        a.name.split(' ')[0],
    'Total':     a.totalLeads,
    Converted:   a.converted,
    Lost:        a.lost,
  }));

  return (
    <div className="space-y-4">
      {/* Team KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ReportStatCard label="Total Agents"    value={data.length}      icon={<Users        className="w-4 h-4" />} color="blue"   />
        <ReportStatCard label="Leads Assigned"  value={totalLeads}       icon={<Users        className="w-4 h-4" />} color="purple" />
        <ReportStatCard label="Total Converted" value={totalConverted}   icon={<CheckCircle2 className="w-4 h-4" />} color="green"  />
        <ReportStatCard label="Team Conv. Rate" value={`${teamRate}%`}   icon={<CheckCircle2 className="w-4 h-4" />} color="amber"  />
      </div>

      {/* Bar Chart */}
      <ReportCard title="Agent Performance Comparison">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Total"     fill="#6366f1" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Converted" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="Lost"      fill="#ef4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ReportCard>

      {/* Top Performers leaderboard */}
      <ReportCard title="Top Performers">
        <div className="space-y-2">
          {sorted.slice(0, 5).map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                i === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i === 0 ? 'bg-amber-400 text-white'
                : i === 1 ? 'bg-slate-300 text-slate-700'
                : i === 2 ? 'bg-orange-300 text-white'
                : 'bg-slate-200 text-slate-500'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800 text-sm">{a.name}</p>
                  <StatusBadge label={a.role} />
                </div>
                <ProgressBar value={a.converted} max={maxConverted} color={i === 0 ? 'amber' : 'blue'} />
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-emerald-600">{a.converted} converted</p>
                <p className="text-xs text-slate-400">{Number(a.conversionRate).toFixed(1)}% rate</p>
              </div>
            </div>
          ))}
        </div>
      </ReportCard>

      {/* Full sortable table */}
      <ReportCard
        title="Full Agent Report"
        noPad
        action={
          <ExportCsvBtn onClick={() => exportToCSV('agent-performance',
            data.map((a) => ({
              Name:            a.name,
              Role:            a.role,
              Email:           a.email,
              'Total Leads':   a.totalLeads,
              Converted:       a.converted,
              Lost:            a.lost,
              'Conv. Rate':    `${Number(a.conversionRate).toFixed(1)}%`,
              'Pending FU':    a.pendingFollowUps,
              'Completed FU':  a.completedFollowUps,
            }))
          )} />
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 uppercase tracking-wide bg-slate-50">
                <th className="px-5 py-3 text-left font-semibold">Agent</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th
                  className="px-5 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('totalLeads')}
                >
                  Total Leads <SortIcon k="totalLeads" />
                </th>
                <th
                  className="px-5 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('converted')}
                >
                  Converted <SortIcon k="converted" />
                </th>
                <th className="px-5 py-3 text-center font-semibold">Lost</th>
                <th
                  className="px-5 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('conversionRate')}
                >
                  Conv. Rate <SortIcon k="conversionRate" />
                </th>
                <th
                  className="px-5 py-3 text-center font-semibold cursor-pointer hover:text-slate-700 select-none"
                  onClick={() => toggleSort('pendingFollowUps')}
                >
                  Pending FU <SortIcon k="pendingFollowUps" />
                </th>
                <th className="px-5 py-3 text-center font-semibold">Done FU</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sorted.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3"><StatusBadge label={a.role} /></td>
                  <td className="px-5 py-3 text-center text-slate-600">{a.totalLeads}</td>
                  <td className="px-5 py-3 text-center font-bold text-emerald-600">{a.converted}</td>
                  <td className="px-5 py-3 text-center text-red-500">{a.lost}</td>
                  <td className="px-5 py-3 text-center font-bold text-indigo-600">
                    {Number(a.conversionRate).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={a.pendingFollowUps > 5 ? 'text-red-500 font-semibold' : 'text-amber-500'}>
                      {a.pendingFollowUps}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-emerald-600">{a.completedFollowUps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportCard>
    </div>
  );
}