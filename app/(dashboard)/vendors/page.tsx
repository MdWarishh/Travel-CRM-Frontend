'use client';

// app/(dashboard)/vendors/page.tsx
// Main Vendors List Page

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { vendorsService } from '@/services/vendors.service';
import { PaginatedResponse, Vendor, VendorQueryParams } from '@/types/vendors';

import { VendorStatsBar }  from './_components/VendorStatsBar';
import { VendorFilters }   from './_components/VendorFilters';
import { VendorTable }     from './_components/VendorTable';
import { VendorFormModal } from './_components/VendorFormModal';

// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: VendorQueryParams = {
  search: '',
  type: '',
  status: '',
  isPreferred: '',
  sortBy: 'name',
};

export default function VendorsPage() {
  const [filters, setFilters] = useState<VendorQueryParams>(DEFAULT_FILTERS);
  const [page, setPage]       = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState<Vendor | null>(null);

  const handleFilterChange = useCallback((f: VendorQueryParams) => {
    setFilters(f);
    setPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }, []);

  const { data, isLoading } = useQuery<PaginatedResponse<Vendor>>({
    queryKey: ['vendors', filters, page],
    queryFn: () =>
      vendorsService.getAll({ ...filters, page: String(page), limit: '20' }),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

 const vendors = data?.data ?? [];
  const pagination = data?.pagination;

  const openCreate = () => { setEditItem(null); setShowModal(true); };
  const openEdit   = (v: Vendor) => { setEditItem(v); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditItem(null); };

  return (
    <div className="space-y-5 p-6">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Vendors & Suppliers</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {pagination
              ? `${pagination.total} vendor${pagination.total !== 1 ? 's' : ''} in your network`
              : 'Manage your supplier network'}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <VendorStatsBar />

      {/* ── Filters ───────────────────────────────────────────────── */}
      <VendorFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* ── Table card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Empty state */}
        {!isLoading && vendors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-600">No vendors found</p>
              <p className="text-sm text-slate-400 mt-0.5">
                {Object.values(filters).some(Boolean)
                  ? 'Try adjusting your filters'
                  : 'Start by adding hotels, transport, and other suppliers'}
              </p>
            </div>
            {!Object.values(filters).some(Boolean) && (
              <Button onClick={openCreate} className="mt-1 gap-1.5" size="sm">
                <Plus className="w-3.5 h-3.5" />
                Add First Vendor
              </Button>
            )}
          </div>
        )}

        {/* Table */}
        {(isLoading || vendors.length > 0) && (
          <VendorTable
            vendors={vendors}
            isLoading={isLoading}
            onEdit={openEdit}
          />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs text-slate-400">
              Showing{' '}
              <span className="font-semibold text-slate-600">
                {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600">{pagination.total}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => setPage((p) => p - 1)}
                className="h-7 px-3 text-xs border border-slate-200 rounded-lg
                  disabled:opacity-40 hover:bg-white transition-colors"
              >
                ← Prev
              </button>

              {/* Page pills */}
              {Array.from(
                { length: Math.min(pagination.totalPages, 7) },
                (_, i) => i + 1
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 text-xs rounded-lg transition-colors ${
                    p === page
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={!pagination.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-3 text-xs border border-slate-200 rounded-lg
                  disabled:opacity-40 hover:bg-white transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <VendorFormModal
        open={showModal}
        onClose={closeModal}
        editItem={editItem}
      />
    </div>
  );
}