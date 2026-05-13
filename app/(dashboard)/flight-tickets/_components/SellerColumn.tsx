'use client';

import { useState, useCallback } from 'react';
import { Plus, Search, Plane, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';
import { useTicketSellers, useDeleteSeller, ticketKeys } from './useTicketData';
import { SellerCard } from './SellerCard';
import { SellerFormSheet } from './SellerFormSheet';
import { SellerDetailSheet } from './SellerDetailSheet';
import { useQueryClient } from '@tanstack/react-query';
import type { TicketSeller } from '@/types/ticket.types';

interface Props {
  onStatsRefresh: () => void;
}

export function SellerColumn({ onStatsRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<TicketSeller | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { can } = useTicketPermission();
  const qc = useQueryClient();

  const canView   = can('canViewSellers');
  const canAdd    = can('canAddSellers');
  const canEdit   = can('canEditSellers');
  const canDelete = can('canDeleteSellers');

  const { data: sellers = [], isLoading } = useTicketSellers();
  const deleteMutation = useDeleteSeller();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    onStatsRefresh();
  };

  const handleFormSuccess = (seller: TicketSeller, isNew: boolean) => {
    qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] });
    setFormOpen(false);
    setEditingSeller(null);
    onStatsRefresh();
  };

  const filtered = sellers.filter(s =>
    !search || [s.brokerName, s.fromCity, s.toCity, s.airline, s.flightNumber]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const visible = user?.role === 'AGENT'
    ? filtered.filter(s => s.createdById === user.id)
    : filtered;

  if (!canView) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-8">
        <div className="text-center space-y-2">
          <Plane className="h-8 w-8 mx-auto opacity-20" />
          <p className="text-sm font-medium">No access to sellers</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-[340px] max-w-[380px] flex-shrink-0 border-r bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/40">
              <Plane className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Sellers</p>
              <p className="text-xs text-muted-foreground mt-0.5">{visible.length} listings</p>
            </div>
          </div>
          {canAdd && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => { setEditingSeller(null); setFormOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search sellers..."
              className="h-8 pl-8 text-xs bg-muted/40"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border p-3.5 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </div>
              ))
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Plane className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No seller listings</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {search ? 'Try a different search' : 'Add the first listing'}
                </p>
                {canAdd && !search && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-7 text-xs"
                    onClick={() => setFormOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Seller
                  </Button>
                )}
              </div>
            ) : (
              visible.map(seller => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={() => { setEditingSeller(seller); setFormOpen(true); }}
                  onDelete={() => handleDelete(seller.id)}
                  onViewDetail={() => setDetailId(seller.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Form Sheet */}
      <SellerFormSheet
        open={formOpen}
        seller={editingSeller}
        onClose={() => { setFormOpen(false); setEditingSeller(null); }}
        onSuccess={handleFormSuccess}
      />

      {/* Detail Sheet */}
      <SellerDetailSheet
        sellerId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={s => {
          setDetailId(null);
          setEditingSeller(s);
          setFormOpen(true);
        }}
      />
    </>
  );
}