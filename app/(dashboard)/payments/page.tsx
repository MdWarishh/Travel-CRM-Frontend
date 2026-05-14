'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Download, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDebounce } from '@/hooks/useDebounce';

import { unifiedPaymentService } from '@/services/payments.service';
import { UnifiedPaymentsQueryParams, UnifiedPayment, CreateUnifiedPaymentData } from '@/types/payment';

import PaymentSummaryCards from './_components/PaymentSummaryCards';
import PaymentsFilters from './_components/PaymentsFilters';
import PaymentsTable from './_components/PaymentsTable';
import AddManualPaymentModal from './_components/AddManualPaymentModal';
import CustomerPaymentProfile from './_components/CustomerPaymentProfile';
import VendorPaymentProfile from './_components/VendorPaymentProfile';

const DEFAULT_FILTERS: UnifiedPaymentsQueryParams = {
  page: 1,
  limit: 20,
  sort: 'latest',
};

export default function PaymentsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<UnifiedPaymentsQueryParams>(DEFAULT_FILTERS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedPayment | null>(null);
  const [customerProfileId, setCustomerProfileId] = useState<string | null>(null);
  const [vendorProfileId, setVendorProfileId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Debounce search only
  const debouncedSearch = useDebounce(filters.search, 350);
  const queryFilters = { ...filters, search: debouncedSearch };

  // ── Data fetching ────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['unified-payments', queryFilters],
    queryFn: () => unifiedPaymentService.getAll(queryFilters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  // ── Mutations ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: CreateUnifiedPaymentData) => unifiedPaymentService.create(payload),
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
    },
    onError: () => toast.error('Failed to record payment'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unifiedPaymentService.delete(id),
    onSuccess: () => {
      toast.success('Payment deleted');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
    },
    onError: () => toast.error('Failed to delete payment'),
  });

  // ── Handlers ─────────────────────────────────
  const handleFilterChange = useCallback((newFilters: UnifiedPaymentsQueryParams) => {
    setFilters(newFilters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await unifiedPaymentService.exportCsv({
        type:      filters.type,
        source:    filters.source,
        status:    filters.status,
        method:    filters.method,
        startDate: filters.startDate,
        endDate:   filters.endDate,
      });
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const summary  = data?.summary;
  const payments = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto">

      {/* ── Header ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Unified ledger — all incoming &amp; outgoing payments in one place
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={exporting}
            className="gap-2"
          >
            {exporting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Download className="h-4 w-4" />
            }
            Export CSV
          </Button>

          <Button size="sm" className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Manual
          </Button>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────── */}
      <PaymentSummaryCards summary={summary} isLoading={isLoading} />

      {/* ── Filters ─────────────────────────────── */}
      <PaymentsFilters filters={filters} onChange={handleFilterChange} />

      {/* ── Table ───────────────────────────────── */}
      <div className="relative">
        {/* Subtle refetch indicator (not full loading state) */}
        {isFetching && !isLoading && (
          <div className="absolute -top-2 right-0 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing…
          </div>
        )}

        <PaymentsTable
          payments={payments}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onDelete={setDeleteTarget}
          onViewCustomer={setCustomerProfileId}
          onViewVendor={setVendorProfileId}
        />
      </div>

      {/* ── Modals & Sheets ─────────────────────── */}
      <AddManualPaymentModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmit={async (data) => { await createMutation.mutateAsync(data); }}
      />

      <CustomerPaymentProfile
        customerId={customerProfileId}
        onClose={() => setCustomerProfileId(null)}
      />

      <VendorPaymentProfile
        vendorId={vendorProfileId}
        onClose={() => setVendorProfileId(null)}
      />

      {/* ── Delete Confirm ──────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Delete Payment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this manual payment entry.
              Auto-synced payments from bookings, invoices, and flight deals cannot be deleted here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
                : null
              }
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}