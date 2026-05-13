'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/index';
import { useAuthStore } from '@/store/auth.store';
import { StatCard, Card, Spinner, Badge } from '@/components/ui/index';
import {
  Users, UserCheck, BookOpen, CreditCard,
  CalendarClock, TrendingUp, Flame, RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate, leadStatusColors, priorityColors } from '@/utils/helpers';
import type {
  DashboardResponse,
  RecentLead,
  TopAgent,
  DashboardFollowUp,
  AgentPerformance,
} from '@/types/dashboard.types';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useEffect, useState } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f97316', '#ec4899', '#22c55e', '#ef4444'];

// ── Custom pie label rendered as SVG text ───────────────────────────────────
const RADIAN = Math.PI / 180;
function PieCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; name: string;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data, isLoading, refetch } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getData() as Promise<DashboardResponse>,
    refetchInterval: 60000,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (isLoading || !data) return <Spinner />;

  const { stats, charts } = data;
  // ✅ charts ke andar koi bhi field undefined aa sakti hai — safe fallback
  const safeCharts = {
    leadsByStatus: charts?.leadsByStatus ?? [],
    leadsBySource: charts?.leadsBySource ?? [],
  };
  const recentLeads: RecentLead[]              = data.recentLeads        ?? [];
  const topAgents: TopAgent[]                  = data.topAgents          ?? [];
  const upcomingFollowUps: DashboardFollowUp[] = data.upcomingFollowUps  ?? [];
  const agentPerformance: AgentPerformance[]   = data.agentPerformance   ?? [];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {mounted ? `${greeting()}, ${user?.name?.split(' ')[0]} 👋` : 'Welcome 👋'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {mounted
              ? new Date().toLocaleDateString('en-IN', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })
              : ''}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Admin / Manager Stats ───────────────────────────── */}
      {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Leads"
              value={stats.leads.total ?? 0}
              subtitle={`${stats.leads.newToday ?? 0} new today`}
              icon={UserCheck}
              iconColor="text-blue-600"
              trend={{ value: `${stats.leads.conversionRate ?? 0}% conversion`, positive: true }}
            />
            <StatCard
              title="Customers"
              value={stats.customers.total ?? 0}
              icon={Users}
              iconColor="text-purple-600"
            />
            <StatCard
              title="Total Bookings"
              value={stats.bookings.total ?? 0}
              subtitle={`${stats.bookings.confirmed ?? 0} confirmed`}
              icon={BookOpen}
              iconColor="text-green-600"
            />
            <StatCard
              title="Revenue Collected"
              value={formatCurrency(stats.payments.totalCollected ?? 0)}
              subtitle={`${stats.payments.pendingCount ?? 0} pending payments`}
              icon={CreditCard}
              iconColor="text-orange-600"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Converted Leads"
              value={stats.leads.converted ?? 0}
              icon={TrendingUp}
              iconColor="text-green-600"
            />
            <StatCard
              title="Lost Leads"
              value={stats.leads.lost ?? 0}
              icon={Flame}
              iconColor="text-red-600"
            />
            <StatCard
              title="Follow-ups Today"
              value={stats.followUps.dueToday ?? 0}
              subtitle={`${stats.followUps.pending ?? 0} total pending`}
              icon={CalendarClock}
              iconColor="text-yellow-600"
            />
            <StatCard
              title="This Month Revenue"
              value={formatCurrency(stats.payments.thisMonthRevenue ?? 0)}
              icon={CreditCard}
              iconColor="text-blue-600"
            />
          </div>
        </>
      )}

      {/* ── Agent Stats ─────────────────────────────────────── */}
      {user?.role === 'AGENT' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="My Leads"           value={stats.myLeads          ?? 0} icon={UserCheck}    iconColor="text-blue-600" />
          <StatCard title="Converted"          value={stats.myConversions    ?? 0} icon={TrendingUp}   iconColor="text-green-600"
            trend={{ value: `${stats.conversionRate ?? 0}%`, positive: true }} />
          <StatCard title="Today's Follow-ups" value={stats.myTodayFollowUps  ?? 0} icon={CalendarClock} iconColor="text-yellow-600" />
          <StatCard title="Pending Follow-ups" value={stats.myPendingFollowUps ?? 0} icon={CalendarClock} iconColor="text-orange-600" />
        </div>
      )}

      {/* ── Charts ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {safeCharts.leadsByStatus.length > 0 && (
          <Card>
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Leads by Stage</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={safeCharts.leadsByStatus}
                  dataKey="count"
                  nameKey="stageId" 
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                  label={({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = '' }) => (
                    <PieCustomLabel
                      cx={cx} cy={cy} midAngle={midAngle}
                      innerRadius={innerRadius} outerRadius={outerRadius}
                      percent={percent} name={name}
                    />
                  )}
                >
                  {safeCharts.leadsByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Leads']} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {safeCharts.leadsBySource.length > 0 && (
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">Lead Sources</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={safeCharts.leadsBySource}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>

      {/* ── Recent Leads + Top Agents ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recentLeads.length > 0 && (
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Recent Leads</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{lead.name}</p>
                    <p className="text-xs text-slate-500">{lead.phone} · {lead.destination ?? 'No destination'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Badge label={lead.priority} className={priorityColors[lead.priority]} />
                    {/* ✅ stage.title — LeadStage model uses `title` field, not `name` */}
                    <Badge
                      label={lead.stage?.title || 'Unknown'}
                      className={leadStatusColors[lead.stage?.title ?? ''] || 'bg-gray-100 text-gray-600'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Agents — Admin / Manager */}
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && topAgents.length > 0 && (
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Top Agents by Conversions</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {topAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{agent.name}</p>
                    <p className="text-xs text-slate-500">{agent.conversions} conversions</p>
                  </div>
                  <div className="w-20 h-1.5 bg-slate-100 rounded-full">
                    <div
                      className="h-1.5 bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (agent.conversions / Math.max(1, topAgents[0].conversions)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming Follow-ups — Agent */}
        {user?.role === 'AGENT' && upcomingFollowUps.length > 0 && (
          <Card padding={false}>
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-700">Upcoming Follow-ups</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {upcomingFollowUps.map((fu) => (
                <div key={fu.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {fu.lead?.name ?? fu.customer?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500">{fu.type} · {formatDate(fu.dueAt)}</p>
                  </div>
                  <Badge label={fu.status} className="bg-yellow-100 text-yellow-700" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Manager: Agent Performance ──────────────────────── */}
      {user?.role === 'MANAGER' && agentPerformance.length > 0 && (
        <Card padding={false}>
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Team Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="px-4 py-3 text-left">Agent</th>
                  <th className="px-4 py-3 text-left">Total Leads</th>
                  <th className="px-4 py-3 text-left">Converted</th>
                  <th className="px-4 py-3 text-left">Conversion %</th>
                  <th className="px-4 py-3 text-left">Pending Follow-ups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentPerformance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.name}</td>
                    <td className="px-4 py-3">{a.totalLeads}</td>
                    <td className="px-4 py-3 text-green-600 font-medium">{a.converted}</td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600 font-medium">{a.conversionRate}%</span>
                    </td>
                    <td className="px-4 py-3">
                      {a.pendingFollowUps > 0
                        ? <span className="text-yellow-600">{a.pendingFollowUps}</span>
                        : <span className="text-slate-400">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}