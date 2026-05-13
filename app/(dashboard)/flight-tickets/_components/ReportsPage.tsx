'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  BarChart3,
  Route,
  RefreshCw,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ticketReportService } from '@/services/ticket.service';
import type { RevenueReport, GroupBy } from '@/types/ticket.types';
import { format, subMonths } from 'date-fns';

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  positive,
  loading,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  positive?: boolean;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            positive === true
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : positive === false
              ? 'bg-red-100 dark:bg-red-900/30'
              : 'bg-muted',
          )}>
            <Icon className={cn(
              'h-4 w-4',
              positive === true
                ? 'text-emerald-600 dark:text-emerald-400'
                : positive === false
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground',
            )} />
          </div>
        </div>
        {loading ? (
          <>
            <Skeleton className="h-7 w-28 mb-1" />
            <Skeleton className="h-3 w-20" />
          </>
        ) : (
          <>
            <p className={cn(
              'text-2xl font-bold tabular-nums',
              positive === true
                ? 'text-emerald-600 dark:text-emerald-400'
                : positive === false
                ? 'text-red-600 dark:text-red-400'
                : '',
            )}>
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background shadow-lg p-3 text-xs space-y-1.5">
      <p className="font-semibold text-sm mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-medium">{fmt(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

export function ReportsPage() {
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<GroupBy>('month');
  const [dateFrom, setDateFrom] = useState(
    format(subMonths(new Date(), 5), 'yyyy-MM-dd')
  );
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ticketReportService.getRevenue({ dateFrom, dateTo, groupBy });
      setReport(data);
    } catch {
      toast.error('Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, groupBy]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const totals = report?.totals;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Revenue Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track deals, revenue and profit over time
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchReport} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">From Date</Label>
              <Input
                type="date"
                className="h-9 w-40"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To Date</Label>
              <Input
                type="date"
                className="h-9 w-40"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Group By</Label>
              <Select value={groupBy} onValueChange={v => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" className="h-9" onClick={fetchReport}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={totals ? fmt(totals.revenue) : '—'}
          sub={totals ? `${totals.deals} deals · ${totals.seats} seats` : undefined}
          icon={IndianRupee}
          positive={true}
          loading={loading}
        />
        <StatCard
          title="Total Cost"
          value={totals ? fmt(totals.cost) : '—'}
          sub="Paid to sellers"
          icon={TrendingDown}
          positive={false}
          loading={loading}
        />
        <StatCard
          title="Gross Profit"
          value={totals ? fmt(totals.profit) : '—'}
          sub={totals && totals.revenue > 0
            ? `${((totals.profit / totals.revenue) * 100).toFixed(1)}% margin`
            : undefined}
          icon={TrendingUp}
          positive={true}
          loading={loading}
        />
        <StatCard
          title="Total Deals"
          value={totals ? `${totals.deals}` : '—'}
          sub={totals ? `${totals.seats} seats booked` : undefined}
          icon={BarChart3}
          loading={loading}
        />
      </div>

      {/* Revenue vs Cost Area Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue vs Cost Trend</CardTitle>
          <CardDescription className="text-xs">
            {groupBy === 'month' ? 'Monthly' : 'Daily'} breakdown of revenue, cost and profit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : !report?.timeline.length ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No data for selected period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={report.timeline} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => fmt(v)}
                  className="text-muted-foreground"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  name="Cost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#colorCost)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#colorProfit)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Deals Per Period Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deals & Seats</CardTitle>
            <CardDescription className="text-xs">Volume per period</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-52 w-full rounded-xl" />
            ) : !report?.timeline.length ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.timeline} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="deals" name="Deals" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="seats" name="Seats" fill="#a5b4fc" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Route Breakdown Table */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Routes</CardTitle>
                <CardDescription className="text-xs">Revenue by route</CardDescription>
              </div>
              <Route className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : !report?.byRoute.length ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs pl-4">Route</TableHead>
                    <TableHead className="text-xs text-right">Revenue</TableHead>
                    <TableHead className="text-xs text-right">Profit</TableHead>
                    <TableHead className="text-xs text-right pr-4">Deals</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byRoute.slice(0, 8).map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium pl-4 py-2.5">{row.route}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-600 dark:text-emerald-400 py-2.5">
                        {fmt(row.revenue)}
                      </TableCell>
                      <TableCell className={cn(
                        'text-xs text-right py-2.5',
                        row.profit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}>
                        {fmt(Math.abs(row.profit))}
                      </TableCell>
                      <TableCell className="text-xs text-right pr-4 py-2.5">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {row.deals}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Timeline Table */}
      {report?.timeline && report.timeline.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Period Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4 text-xs">Period</TableHead>
                  <TableHead className="text-xs text-right">Revenue</TableHead>
                  <TableHead className="text-xs text-right">Cost</TableHead>
                  <TableHead className="text-xs text-right">Profit</TableHead>
                  <TableHead className="text-xs text-right">Margin</TableHead>
                  <TableHead className="text-xs text-right">Deals</TableHead>
                  <TableHead className="text-xs text-right pr-4">Seats</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.timeline.map((row, i) => {
                  const margin = row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium pl-4 py-2.5">{row.period}</TableCell>
                      <TableCell className="text-xs text-right text-emerald-600 dark:text-emerald-400 py-2.5">{fmt(row.revenue)}</TableCell>
                      <TableCell className="text-xs text-right text-red-600 dark:text-red-400 py-2.5">{fmt(row.cost)}</TableCell>
                      <TableCell className={cn(
                        'text-xs text-right font-semibold py-2.5',
                        row.profit >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      )}>
                        {fmt(Math.abs(row.profit))}
                      </TableCell>
                      <TableCell className="text-xs text-right py-2.5">
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-medium',
                          margin >= 20
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : margin >= 0
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}>
                          {margin.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-right py-2.5">{row.deals}</TableCell>
                      <TableCell className="text-xs text-right pr-4 py-2.5">{row.seats}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}