'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ticketStatsService,
  ticketMatchService,
  ticketSellerService,
  ticketBuyerService,
  ticketDealService,
  ticketPaymentService,
  ticketReportService,
  ticketImportService,
  ticketPermissionService,
} from '@/services/ticket.service';
import type {
  CreateSellerPayload,
  UpdateSellerPayload,
  CreateBuyerPayload,
  UpdateBuyerPayload,
  CreateDealPayload,
  UpdateDealPayload,
  CreatePaymentPayload,
  BulkImportPayload,
  AgentPermission,
  TicketFilters,
} from '@/types/ticket.types';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const ticketKeys = {
  stats:       ['ticket', 'stats'] as const,
  matches:     ['ticket', 'matches'] as const,
  sellers:     (filters?: Record<string, string>) => ['ticket', 'sellers', filters ?? {}] as const,
  seller:      (id: string) => ['ticket', 'seller', id] as const,
  buyers:      (filters?: Record<string, string>) => ['ticket', 'buyers', filters ?? {}] as const,
  buyer:       (id: string) => ['ticket', 'buyer', id] as const,
  deals:       (filters?: Record<string, string>) => ['ticket', 'deals', filters ?? {}] as const,
  deal:        (id: string) => ['ticket', 'deal', id] as const,
  payments:    (dealId: string) => ['ticket', 'payments', dealId] as const,
  revenue:     (params?: object) => ['ticket', 'revenue', params ?? {}] as const,
  importHist:  ['ticket', 'import-history'] as const,
  permissions: ['ticket', 'permissions'] as const,
  permission:  (userId: string) => ['ticket', 'permission', userId] as const,
};

// ═════════════════════════════════════════════════════════════════════════════
// STATS
// ═════════════════════════════════════════════════════════════════════════════

export function useTicketStats() {
  return useQuery({
    queryKey: ticketKeys.stats,
    queryFn: ticketStatsService.get,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// MATCHES
// ═════════════════════════════════════════════════════════════════════════════

export function useTicketMatches() {
  return useQuery({
    queryKey: ticketKeys.matches,
    queryFn: ticketMatchService.getMatches,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SELLERS
// ═════════════════════════════════════════════════════════════════════════════

export function useTicketSellers(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ticketKeys.sellers(filters),
    queryFn: () => ticketSellerService.getAll(filters),
    staleTime: 30_000,
  });
}

export function useTicketSeller(id: string | null) {
  return useQuery({
    queryKey: ticketKeys.seller(id!),
    queryFn: () => ticketSellerService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSellerPayload) => ticketSellerService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Seller listing added');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create seller'),
  });
}

export function useUpdateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSellerPayload }) =>
      ticketSellerService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.seller(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Seller listing updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update seller'),
  });
}

export function useDeleteSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketSellerService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Seller listing removed');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete seller'),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// BUYERS
// ═════════════════════════════════════════════════════════════════════════════

export function useTicketBuyers(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ticketKeys.buyers(filters),
    queryFn: () => ticketBuyerService.getAll(filters),
    staleTime: 30_000,
  });
}

export function useTicketBuyer(id: string | null) {
  return useQuery({
    queryKey: ticketKeys.buyer(id!),
    queryFn: () => ticketBuyerService.getById(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBuyerPayload) => ticketBuyerService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Buyer request added');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create buyer'),
  });
}

export function useUpdateBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBuyerPayload }) =>
      ticketBuyerService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.buyer(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Buyer request updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update buyer'),
  });
}

export function useDeleteBuyer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketBuyerService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Buyer request removed');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete buyer'),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// DEALS
// ═════════════════════════════════════════════════════════════════════════════

export function useTicketDeals(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ticketKeys.deals(filters),
    queryFn: () => ticketDealService.getAll(filters),
    staleTime: 20_000,
  });
}

export function useTicketDeal(id: string | null) {
  return useQuery({
    queryKey: ticketKeys.deal(id!),
    queryFn: () => ticketDealService.getById(id!),
    enabled: !!id,
    staleTime: 20_000,
  });
}

export function useConnectDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDealPayload) => ticketDealService.connect(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      toast.success('Deal connected!');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to connect deal'),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealPayload }) =>
      ticketDealService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
      qc.invalidateQueries({ queryKey: ticketKeys.deal(id) });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      toast.success('Deal updated');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update deal'),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ticketDealService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      toast.success('Deal deleted');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete deal'),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PAYMENTS
// ═════════════════════════════════════════════════════════════════════════════

export function useDealPayments(dealId: string | null) {
  return useQuery({
    queryKey: ticketKeys.payments(dealId!),
    queryFn: () => ticketPaymentService.getByDeal(dealId!),
    enabled: !!dealId,
    staleTime: 15_000,
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ dealId, data }: { dealId: string; data: CreatePaymentPayload }) =>
      ticketPaymentService.add(dealId, data),
    onSuccess: (_, { dealId }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.payments(dealId) });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      toast.success('Payment recorded');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to record payment'),
  });
}

export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, dealId }: { paymentId: string; dealId: string }) =>
      ticketPaymentService.delete(paymentId),
    onSuccess: (_, { dealId }) => {
      qc.invalidateQueries({ queryKey: ticketKeys.payments(dealId) });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      toast.success('Payment removed');
    },
    onError: () => toast.error('Failed to remove payment'),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// REPORTS
// ═════════════════════════════════════════════════════════════════════════════

export function useRevenueReport(params?: { dateFrom?: string; dateTo?: string; groupBy?: 'month' | 'day' }) {
  return useQuery({
    queryKey: ticketKeys.revenue(params),
    queryFn: () => ticketReportService.getRevenue(params),
    staleTime: 60_000,
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// IMPORT
// ═════════════════════════════════════════════════════════════════════════════

export function useImportHistory() {
  return useQuery({
    queryKey: ticketKeys.importHist,
    queryFn: ticketImportService.getHistory,
    staleTime: 60_000,
  });
}

export function useBulkImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkImportPayload) => ticketImportService.bulkImport(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] });
      qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] });
      qc.invalidateQueries({ queryKey: ticketKeys.stats });
      qc.invalidateQueries({ queryKey: ticketKeys.matches });
      qc.invalidateQueries({ queryKey: ticketKeys.importHist });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Import failed'),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// PERMISSIONS
// ═════════════════════════════════════════════════════════════════════════════

export function useAllPermissions() {
  return useQuery({
    queryKey: ticketKeys.permissions,
    queryFn: ticketPermissionService.getAll,
    staleTime: 120_000,
  });
}

export function useUpsertPermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AgentPermission> & { userId: string }) =>
      ticketPermissionService.upsert(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ticketKeys.permissions });
      toast.success('Permissions saved');
    },
    onError: () => toast.error('Failed to save permissions'),
  });
}