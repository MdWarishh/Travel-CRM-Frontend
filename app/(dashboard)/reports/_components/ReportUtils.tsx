'use client';
// app/(dashboard)/reports/_components/ReportUtils.tsx

export const CHART_COLORS = [
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#f97316', '#06b6d4', '#84cc16',
  '#ec4899', '#a855f7',
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  CONVERTED:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  COMPLETED:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PAID:           'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ACTIVE:         'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PENDING:        'bg-amber-50  text-amber-700  ring-amber-200',
  PARTIAL:        'bg-amber-50  text-amber-700  ring-amber-200',
  CANCELLED:      'bg-red-50    text-red-700    ring-red-200',
  LOST:           'bg-red-50    text-red-700    ring-red-200',
  REJECTED:       'bg-red-50    text-red-700    ring-red-200',
  UNPAID:         'bg-red-50    text-red-700    ring-red-200',
  CONFIRMED:      'bg-blue-50   text-blue-700   ring-blue-200',
  HOT:            'bg-red-50    text-red-700    ring-red-200',
  WARM:           'bg-amber-50  text-amber-700  ring-amber-200',
  COLD:           'bg-blue-50   text-blue-700   ring-blue-200',
  AGENT:          'bg-blue-50   text-blue-700   ring-blue-200',
  MANAGER:        'bg-violet-50 text-violet-700 ring-violet-200',
};

export function StatusBadge({ label }: { label: string }) {
  const cls = STATUS_STYLES[label] ?? 'bg-slate-50 text-slate-600 ring-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ring-1 ${cls}`}>
      {label}
    </span>
  );
}

// ─── Export CSV ───────────────────────────────────────────────────────────────
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}.csv`;
  a.click();
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function ReportEmpty({ label = 'No data available' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-slate-300 gap-3">
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

// ─── Export Button ────────────────────────────────────────────────────────────
export function ExportCsvBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export CSV
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
interface ReportCardProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  noPad?: boolean;
}

export function ReportCard({ title, children, action, noPad }: ReportCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
type StatColor = 'blue' | 'green' | 'red' | 'purple' | 'amber' | 'teal' | 'pink' | 'indigo' | 'orange' | 'violet';

interface ReportStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: StatColor;
  sub?: string;
}

const COLOR_MAP: Record<StatColor, { bg: string; text: string; val: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-500',   val: 'text-blue-700' },
  green:  { bg: 'bg-emerald-50',text: 'text-emerald-500',val: 'text-emerald-700' },
  red:    { bg: 'bg-red-50',    text: 'text-red-500',    val: 'text-red-700' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-500', val: 'text-purple-700' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-500',  val: 'text-amber-700' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-500',   val: 'text-teal-700' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-500',   val: 'text-pink-700' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-500', val: 'text-indigo-700' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-500', val: 'text-orange-700' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-500', val: 'text-violet-700' },
};

export function ReportStatCard({ label, value, icon, color, sub }: ReportStatCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className={`${c.bg} ${c.text} p-2.5 rounded-xl shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
        <p className={`text-xl font-bold truncate mt-0.5 ${c.val}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = 'blue' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const colors: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-emerald-500', amber: 'bg-amber-500', red: 'bg-red-500', purple: 'bg-purple-500',
  };
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colors[color] ?? 'bg-blue-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Tab Skeleton ─────────────────────────────────────────────────────────────
export function TabSkeleton({ cards = 4, rows = 2 }: { cards?: number; rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className={`grid grid-cols-2 sm:grid-cols-${Math.min(cards, 4)} gap-3`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-2xl" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`h-${i === 0 ? '64' : '56'} bg-slate-100 rounded-2xl`} />
      ))}
    </div>
  );
}