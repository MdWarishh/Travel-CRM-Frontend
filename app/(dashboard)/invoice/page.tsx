'use client';

import { useState, useEffect, useCallback, useDeferredValue } from 'react';
import { useRouter } from 'next/navigation';
import { invoiceService } from '@/services/invoice.service';
import { GstInvoice, InvoiceStats, InvoiceStatus } from '@/types/invoice';
import { InvoiceStatsCards } from './_components/InvoiceStatsCards';
import { InvoiceFilters } from './_components/InvoiceFilters';
import { InvoiceTable } from './_components/InvoiceTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Plus,
  FileText,
  Settings,
  RefreshCw,
  TrendingUp,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Filters {
  search: string;
  status: string;
  sort: string;
}

const LIMIT = 15;

export default function InvoicePage() {
  const router = useRouter();

  const [invoices, setInvoices] = useState<GstInvoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [overdueCount, setOverdueCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState<Filters>({ search: '', status: 'all', sort: 'newest' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deferredSearch = useDeferredValue(filters.search);

  const fetchInvoices = useCallback(
    async (opts: { showRefresh?: boolean } = {}) => {
      if (opts.showRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await invoiceService.getAll({
          page,
          limit: LIMIT,
          search: deferredSearch || undefined,
          status: (filters.status !== 'all' ? filters.status : undefined) as InvoiceStatus | undefined,
          sort: filters.sort as any,
        });
        setInvoices(result.invoices);
        setStats(result.stats);
        setPagination(result.pagination);
      } catch {
        toast.error('Failed to load invoices');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, deferredSearch, filters.status, filters.sort]
  );

  const fetchDashboard = useCallback(async () => {
    try {
      const dash = await invoiceService.getDashboard();
      setOverdueCount(dash.overdueCount);
    } catch {}
  }, []);

  useEffect(() => {
    fetchInvoices();
    fetchDashboard();
  }, [fetchInvoices]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.status, filters.sort]);

  const handleRefresh = () => fetchInvoices({ showRefresh: true });

  // Pagination helper
  const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-600 text-white shadow-sm shadow-violet-200">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            GST-compliant invoices · Manage billing &amp; payments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/invoice/settings')}
            className="gap-1.5"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            size="sm"
            onClick={() => router.push('/invoice/new')}
            className="gap-1.5 bg-violet-600 hover:bg-violet-700 shadow-sm shadow-violet-200"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : stats ? (
        <InvoiceStatsCards stats={stats} overdueCount={overdueCount} />
      ) : null}

      {/* ── Main Card ── */}
      <div className="rounded-xl border bg-card shadow-sm">
        {/* Filters bar */}
        <div className="border-b px-5 py-4">
          <InvoiceFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Result count */}
        {!loading && (
          <div className="flex items-center justify-between border-b bg-muted/20 px-5 py-2.5">
            <p className="text-xs text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, pagination.total)}
              </span>{' '}
              of <span className="font-semibold text-foreground">{pagination.total}</span> invoices
            </p>
            {pagination.total > 0 && (
              <p className="text-xs text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <InvoiceTable
            invoices={invoices}
            isLoading={loading}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="border-t px-5 py-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={cn(page === 1 && 'pointer-events-none opacity-40', 'cursor-pointer')}
                  />
                </PaginationItem>

                {visiblePages.map((p, idx) => {
                  const prev = visiblePages[idx - 1];
                  const showEllipsis = prev !== undefined && p - prev > 1;
                  return (
                    <>
                      {showEllipsis && (
                        <PaginationItem key={`ell-${p}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    className={cn(
                      page === pagination.totalPages && 'pointer-events-none opacity-40',
                      'cursor-pointer'
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}