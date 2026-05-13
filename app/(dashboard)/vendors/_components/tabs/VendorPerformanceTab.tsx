'use client';

// app/(dashboard)/vendors/_components/tabs/VendorPerformanceTab.tsx

import { TrendingUp, AlertTriangle, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { VendorPerformance, VendorSummary } from '@/types/vendors';
import { formatDate } from '../vendor.constants';

// ── Score ring (SVG) ──────────────────────────────────────────────────────────

function ScoreRing({
  score,
  color,
  size = 88,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <svg width={size} height={size} viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 44 44)"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text
        x="44"
        y="44"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-[18px] font-bold"
        fill="#1e293b"
        fontSize="18"
        fontWeight="700"
      >
        {score}
      </text>
    </svg>
  );
}

// ── Score level label ─────────────────────────────────────────────────────────
function levelLabel(score: number) {
  if (score >= 80) return { label: 'Excellent', color: '#10b981' };
  if (score >= 60) return { label: 'Good',      color: '#3b82f6' };
  if (score >= 40) return { label: 'Average',   color: '#f59e0b' };
  return              { label: 'Poor',       color: '#ef4444' };
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function BarStat({
  label,
  value,
  max = 100,
  color,
  suffix = '%',
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-sm font-bold text-slate-800">
          {value}{suffix}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function VendorPerformanceTab({
  performance,
  summary,
}: {
  performance: VendorPerformance;
  summary: VendorSummary;
}) {
  const reliability = performance.reliabilityScore;
  const cancellation = performance.cancellationRate;
  const { label: reliLabel, color: reliColor } = levelLabel(reliability);

  const reliabilityRingColor =
    reliability >= 70 ? '#10b981' : reliability >= 40 ? '#f59e0b' : '#ef4444';

  const cancellationRingColor =
    cancellation <= 10 ? '#10b981' : cancellation <= 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-5">
      {/* ── Top score cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Reliability */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Reliability Score
              </p>
              <p className="text-3xl font-black text-slate-900 leading-none">{reliability}</p>
              <p className="text-xs font-semibold mt-1" style={{ color: reliabilityRingColor }}>
                {reliLabel}
              </p>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                Based on total bookings ({performance.totalBookings}) and cancellations ({performance.cancelledCount})
              </p>
            </div>
            <ScoreRing score={reliability} color={reliabilityRingColor} />
          </div>
          <div className="mt-4">
            <BarStat
              label="Reliability"
              value={reliability}
              color={reliabilityRingColor}
            />
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Cancellation Rate
              </p>
              <p className="text-3xl font-black text-slate-900 leading-none">
                {cancellation}%
              </p>
              <p
                className="text-xs font-semibold mt-1"
                style={{ color: cancellationRingColor }}
              >
                {cancellation <= 10 ? 'Very Low' : cancellation <= 25 ? 'Moderate' : 'High'}
              </p>
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                {performance.cancelledCount} cancelled out of {performance.totalBookings} total bookings
              </p>
            </div>
            <ScoreRing score={Math.min(cancellation, 100)} color={cancellationRingColor} />
          </div>
          <div className="mt-4">
            <BarStat
              label="Cancellation Rate"
              value={cancellation}
              color={cancellationRingColor}
            />
          </div>
        </div>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            icon: Activity,
            label: 'Total Bookings',
            value: performance.totalBookings,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            icon: CheckCircle2,
            label: 'Active Now',
            value: performance.activeCount,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            icon: XCircle,
            label: 'Cancelled',
            value: performance.cancelledCount,
            color: 'text-red-500',
            bg: 'bg-red-50',
          },
          {
            icon: Clock,
            label: 'Last Used',
            value: formatDate(performance.lastUsedDate),
            color: 'text-slate-600',
            bg: 'bg-slate-100',
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-[11px] text-slate-400 font-medium mb-0.5">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Summary revenue stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          {
            label: 'Total Revenue',
            value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summary.totalRevenue),
            color: 'text-emerald-600',
          },
          {
            label: 'Total Collected',
            value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summary.totalPaid),
            color: 'text-blue-600',
          },
          {
            label: 'Pending Collection',
            value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(summary.pendingPaymentsAmount),
            color: 'text-amber-600',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-400 font-medium mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}