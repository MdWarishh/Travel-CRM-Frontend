'use client';

// app/(dashboard)/vendors/_components/VendorTable.tsx

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  MoreHorizontal, Pencil, Trash2, Star, StarOff,
  ArrowUpRight, ShieldX, CheckCircle2, PauseCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

import { vendorsService } from '@/services/vendors.service';
import { Vendor, VendorStatus, VendorServiceType } from '@/types/vendors';
import {
  VENDOR_TYPE_COLORS,
  VENDOR_STATUS_CONFIG,
  formatCurrency,
  getTypeEmoji,
} from './vendor.constants';

// ── Type badges ───────────────────────────────────────────────────────────────

function TypeBadges({ types }: { types: string[] }) {
  const display = (types ?? []).slice(0, 2);
  const extra   = (types ?? []).length - 2;
  return (
    <div className="flex flex-wrap gap-1">
      {display.map((t) => (
        <span
          key={t}
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-medium border
            ${VENDOR_TYPE_COLORS[t as VendorServiceType] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
        >
          {getTypeEmoji(t as VendorServiceType)} {t.replace(/_/g, ' ')}
        </span>
      ))}
      {extra > 0 && (
        <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
          +{extra}
        </span>
      )}
    </div>
  );
}

// ── Status pill ───────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: VendorStatus }) {
  const cfg = VENDOR_STATUS_CONFIG[status] ?? VENDOR_STATUS_CONFIG.INACTIVE;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md hidden md:block" />
          <Skeleton className="h-4 w-20 hidden lg:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface VendorTableProps {
  vendors: Vendor[];
  isLoading: boolean;
  onEdit: (vendor: Vendor) => void;
}

export function VendorTable({ vendors, isLoading, onEdit }: VendorTableProps) {
  const qc     = useQueryClient();
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['vendors'] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => vendorsService.delete(id),
    onSuccess: () => { invalidate(); toast.success('Vendor deleted'); setDeleteTarget(null); },
    onError:   () => toast.error('Could not delete vendor'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) =>
      vendorsService.changeStatus(id, { status }),
    onSuccess: () => { invalidate(); toast.success('Status updated'); },
    onError:   () => toast.error('Failed to update status'),
  });

  const preferredMutation = useMutation({
    mutationFn: (id: string) => vendorsService.togglePreferred(id),
    onSuccess: () => { invalidate(); toast.success('Preference updated'); },
    onError:   () => toast.error('Failed to update preference'),
  });

  // ── Safe navigate — only if id is a real string ──────────────────────────
  const goToDetail = (id: string | undefined) => {
    if (!id || id === 'undefined') {
      toast.error('Vendor ID missing');
      return;
    }
    router.push(`/vendors/${id}`);
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Vendor
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Types
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                Contact
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Usage
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                Revenue
              </th>
              <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50/80">
            {vendors.map((v) => {
              // Normalize types — handle both new 'types' array and legacy 'serviceType'
              const types: string[] =
                Array.isArray(v.types) && v.types.length > 0
                  ? v.types
                  : v.serviceType
                  ? [v.serviceType]
                  : ['OTHER'];

              // Safety check
              const vendorId = v?.id;

              return (
                <tr
                  key={vendorId ?? Math.random()}
                  className="group hover:bg-blue-50/20 transition-colors cursor-pointer"
                  onClick={() => goToDetail(vendorId)}
                >
                  {/* Name + location */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm">
                        {(v.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {v.name ?? 'Unknown'}
                          </p>
                          {v.isPreferred && (
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {[v.city, v.country].filter(Boolean).join(', ') || 'Location not set'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Types */}
                  <td className="px-5 py-3.5">
                    <TypeBadges types={types} />
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <div className="space-y-0.5">
                      {v.phone && <p className="text-xs text-slate-600 font-medium">{v.phone}</p>}
                      {v.email && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{v.email}</p>
                      )}
                      {!v.phone && !v.email && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>

                  {/* Usage */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {v.totalBookings != null ? (
                      <div>
                        <p className="text-sm font-bold text-slate-700">{v.totalBookings}</p>
                        <p className="text-[11px] text-slate-400">bookings</p>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {v.totalRevenue != null ? (
                      <p className="text-sm font-bold text-emerald-600">
                        {formatCurrency(v.totalRevenue)}
                      </p>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <StatusPill status={v.status ?? 'INACTIVE'} />
                  </td>

                  {/* Actions */}
                  <td
                    className="px-3 py-3.5 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400
                          hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => goToDetail(vendorId)}
                          disabled={!vendorId}
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(v)}>
                          <Pencil className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          Edit Vendor
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => vendorId && preferredMutation.mutate(vendorId)}
                          disabled={!vendorId}
                        >
                          {v.isPreferred
                            ? <><StarOff className="w-3.5 h-3.5 mr-2 text-slate-400" /> Remove Preferred</>
                            : <><Star className="w-3.5 h-3.5 mr-2 text-amber-400" /> Mark as Preferred</>
                          }
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {v.status !== 'ACTIVE' && (
                          <DropdownMenuItem
                            onClick={() => vendorId && statusMutation.mutate({ id: vendorId, status: 'ACTIVE' })}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Activate
                          </DropdownMenuItem>
                        )}
                        {v.status !== 'INACTIVE' && (
                          <DropdownMenuItem
                            onClick={() => vendorId && statusMutation.mutate({ id: vendorId, status: 'INACTIVE' })}
                          >
                            <PauseCircle className="w-3.5 h-3.5 mr-2 text-slate-400" /> Deactivate
                          </DropdownMenuItem>
                        )}
                        {v.status !== 'BLACKLISTED' && (
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => vendorId && statusMutation.mutate({ id: vendorId, status: 'BLACKLISTED' })}
                          >
                            <ShieldX className="w-3.5 h-3.5 mr-2" /> Blacklist Vendor
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => vendorId && setDeleteTarget(vendorId)}
                          disabled={!vendorId}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the vendor and all associated notes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}