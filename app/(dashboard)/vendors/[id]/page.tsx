'use client';

// app/(dashboard)/vendors/[id]/page.tsx

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Star, StarOff, Pencil, MapPin,
  Building2, BookOpen, CreditCard, TrendingUp, StickyNote,
  CheckCircle2, PauseCircle, ShieldX, Phone, Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Button }   from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { vendorsService }      from '@/services';
import { VendorStatus, VendorServiceType } from '@/types/vendors';
import { VendorFormModal }     from '../_components/VendorFormModal';
import { VendorOverviewTab }   from '../_components/tabs/VendorOverviewTab';
import { VendorBookingsTab }   from '../_components/tabs/VendorBookingsTab';
import { VendorPaymentsTab }   from '../_components/tabs/VendorPaymentsTab';
import { VendorPerformanceTab } from '../_components/tabs/VendorPerformanceTab';
import { VendorNotesTab }      from '../_components/tabs/VendorNotesTab';
import {
  VENDOR_TYPE_COLORS,
  VENDOR_STATUS_CONFIG,
  formatCurrency,
  formatDate,
  getTypeEmoji,
} from '../_components/vendor.constants';

// ── Summary card ──────────────────────────────────────────────────────────────

function SummaryCard({
  label, value, sub, icon: Icon, iconBg, iconColor,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
            {label}
          </p>
          <p className="text-xl font-black text-slate-900 leading-tight truncate">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

// ── Page skeleton ─────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-5 p-6">
      <Skeleton className="h-5 w-32" />
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <div className="flex gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function VendorDetailPage() {
  // FIX: Use useParams() hook instead of props — works in all Next.js versions
  const params    = useParams();
  const vendorId  = params?.id as string;

  const router = useRouter();
  const qc     = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);

  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ['vendors', vendorId],
    queryFn:  () => vendorsService.getById(vendorId),
    enabled:  !!vendorId && vendorId !== 'undefined',
    staleTime: 30_000,
    retry: 1,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['vendors', vendorId] });

  const statusMutation = useMutation({
    mutationFn: (status: VendorStatus) =>
      vendorsService.changeStatus(vendorId, { status }),
    onSuccess: () => { invalidate(); toast.success('Status updated'); },
    onError:   () => toast.error('Failed to update status'),
  });

  const preferredMutation = useMutation({
    mutationFn: () => vendorsService.togglePreferred(vendorId),
    onSuccess:  () => { invalidate(); },
    onError:    () => toast.error('Failed to update preference'),
  });

  // Invalid id guard
  if (!vendorId || vendorId === 'undefined') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Building2 className="w-10 h-10 text-slate-300" />
        <p className="text-slate-500 font-medium">Invalid vendor link</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/vendors')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vendors
        </Button>
      </div>
    );
  }

  if (isLoading) return <PageSkeleton />;

  if (isError || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 p-6">
        <Building2 className="w-10 h-10 text-slate-300" />
        <p className="text-slate-500 font-medium">Vendor not found</p>
        <p className="text-xs text-slate-400">This vendor may have been deleted.</p>
        <Button variant="outline" size="sm" onClick={() => router.push('/vendors')}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vendors
        </Button>
      </div>
    );
  }

  const statusCfg = VENDOR_STATUS_CONFIG[vendor.status] ?? VENDOR_STATUS_CONFIG.INACTIVE;
  const types = Array.isArray(vendor.types) && vendor.types.length > 0
    ? vendor.types
    : vendor.serviceType
    ? [vendor.serviceType]
    : ['OTHER'];

  const summary     = vendor.summary     ?? { totalBookings: 0, totalRevenue: 0, lastUsedDate: null, activeBookingsCount: 0, pendingPaymentsAmount: 0, totalPaid: 0 };
  const bookings    = vendor.bookings    ?? [];
  const payments    = vendor.payments    ?? { totalPaid: 0, pendingAmount: 0, history: [] };
  const performance = vendor.performance ?? { totalBookings: 0, lastUsedDate: null, cancellationRate: 0, reliabilityScore: 0, cancelledCount: 0, activeCount: 0 };
  const notes       = vendor.notes       ?? [];

  return (
    <>
      <div className="min-h-full bg-slate-50/30 space-y-5 p-6">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/vendors')}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vendors
        </button>

        {/* Header card */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              {/* Left: avatar + info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-md">
                  {(vendor.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-black text-slate-900 leading-tight">
                      {vendor.name}
                    </h1>
                    {vendor.isPreferred && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        Preferred
                      </span>
                    )}
                  </div>

                  {/* Type badges */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {types.map((t) => (
                      <span
                        key={t}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border
                          ${VENDOR_TYPE_COLORS[t as VendorServiceType] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                      >
                        {getTypeEmoji(t as VendorServiceType)} {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center flex-wrap gap-3 mt-2.5">
                    {(vendor.city || vendor.country) && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        {[vendor.city, vendor.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {vendor.phone && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="w-3 h-3" />{vendor.phone}
                      </span>
                    )}
                    {vendor.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="w-3 h-3" />{vendor.email}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => preferredMutation.mutate()}
                  disabled={preferredMutation.isPending}
                  className="gap-1.5"
                >
                  {vendor.isPreferred
                    ? <><StarOff className="w-3.5 h-3.5" /> Unmark</>
                    : <><Star className="w-3.5 h-3.5 text-amber-500" /> Preferred</>
                  }
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      disabled={vendor.status === 'ACTIVE'}
                      onClick={() => statusMutation.mutate('ACTIVE')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={vendor.status === 'INACTIVE'}
                      onClick={() => statusMutation.mutate('INACTIVE')}
                    >
                      <PauseCircle className="w-3.5 h-3.5 mr-2 text-slate-400" /> Deactivate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      disabled={vendor.status === 'BLACKLISTED'}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={() => statusMutation.mutate('BLACKLISTED')}
                    >
                      <ShieldX className="w-3.5 h-3.5 mr-2" /> Blacklist Vendor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Edit Vendor
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <SummaryCard icon={BookOpen}      label="Total Bookings"    value={String(summary.totalBookings)}           sub={summary.lastUsedDate ? `Last: ${formatDate(summary.lastUsedDate)}` : 'Never used'} iconBg="bg-blue-50"    iconColor="text-blue-600" />
          <SummaryCard icon={TrendingUp}    label="Total Revenue"     value={formatCurrency(summary.totalRevenue)}    iconBg="bg-emerald-50"  iconColor="text-emerald-600" />
          <SummaryCard icon={CheckCircle2}  label="Active Bookings"   value={String(summary.activeBookingsCount)}     iconBg="bg-indigo-50"   iconColor="text-indigo-600" />
          <SummaryCard icon={CreditCard}    label="Pending Payment"   value={formatCurrency(summary.pendingPaymentsAmount)} sub="yet to collect" iconBg="bg-amber-50" iconColor="text-amber-600" />
          <SummaryCard icon={Building2}     label="Total Collected"   value={formatCurrency(summary.totalPaid)}       iconBg="bg-violet-50"   iconColor="text-violet-600" />
        </div>

        {/* Tabs */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <Tabs defaultValue="overview">
            <div className="border-b border-slate-100 px-5 bg-slate-50/40">
              <TabsList className="h-auto bg-transparent p-0 gap-0">
                {[
                  { value: 'overview',    label: 'Overview',    icon: Building2,  count: null },
                  { value: 'bookings',    label: 'Bookings',    icon: BookOpen,   count: bookings.length },
                  { value: 'payments',    label: 'Payments',    icon: CreditCard, count: payments.history.length },
                  { value: 'performance', label: 'Performance', icon: TrendingUp, count: null },
                  { value: 'notes',       label: 'Notes',       icon: StickyNote, count: notes.length },
                ].map(({ value, label, icon: Icon, count }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="relative flex items-center gap-1.5 px-4 py-3.5 text-sm text-slate-500 font-medium
                      rounded-none border-b-2 border-transparent bg-transparent
                      data-[state=active]:text-blue-600 data-[state=active]:border-blue-600
                      data-[state=active]:bg-transparent data-[state=active]:shadow-none
                      hover:text-slate-700 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                    {count !== null && count > 0 && (
                      <span className="ml-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-5 sm:p-6">
              <TabsContent value="overview"    className="mt-0 focus-visible:ring-0">
                <VendorOverviewTab vendor={vendor} />
              </TabsContent>
              <TabsContent value="bookings"    className="mt-0 focus-visible:ring-0">
                <VendorBookingsTab bookings={bookings} />
              </TabsContent>
              <TabsContent value="payments"    className="mt-0 focus-visible:ring-0">
                <VendorPaymentsTab payments={payments} />
              </TabsContent>
              <TabsContent value="performance" className="mt-0 focus-visible:ring-0">
                <VendorPerformanceTab performance={performance} summary={summary} />
              </TabsContent>
              <TabsContent value="notes"       className="mt-0 focus-visible:ring-0">
                <VendorNotesTab vendorId={vendorId} notes={notes} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

      </div>

      <VendorFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editItem={vendor}
      />
    </>
  );
}