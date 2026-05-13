'use client';

import { useState } from 'react';
import { Plus, Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';
import { useTicketBuyers, useDeleteBuyer } from './useTicketData';
import { BuyerCard } from './BuyerCard';
import { BuyerFormSheet } from './BuyerFormSheet';
import { BuyerDetailSheet } from './BuyerDetailSheet';
import { useQueryClient } from '@tanstack/react-query';
import type { TicketBuyer } from '@/types/ticket.types';

interface Props {
  onStatsRefresh: () => void;
}

export function BuyerColumn({ onStatsRefresh }: Props) {
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<TicketBuyer | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { can } = useTicketPermission();
  const qc = useQueryClient();

  const canView   = can('canViewBuyers');
  const canAdd    = can('canAddBuyers');
  const canEdit   = can('canEditBuyers');
  const canDelete = can('canDeleteBuyers');

  const { data: buyers = [], isLoading } = useTicketBuyers();
  const deleteMutation = useDeleteBuyer();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    onStatsRefresh();
  };

  const handleFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] });
    setFormOpen(false);
    setEditingBuyer(null);
    onStatsRefresh();
  };

  const filtered = buyers.filter(b =>
    !search || [b.brokerName, b.fromCity, b.toCity]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  const visible = user?.role === 'AGENT'
    ? filtered.filter(b => b.createdById === user.id)
    : filtered;

  if (!canView) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-8">
        <div className="text-center space-y-2">
          <ShoppingCart className="h-8 w-8 mx-auto opacity-20" />
          <p className="text-sm font-medium">No access to buyers</p>
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
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 dark:bg-violet-900/40">
              <ShoppingCart className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Buyers</p>
              <p className="text-xs text-muted-foreground mt-0.5">{visible.length} requests</p>
            </div>
          </div>
          {canAdd && (
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => { setEditingBuyer(null); setFormOpen(true); }}
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
              placeholder="Search buyers..."
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
                <ShoppingCart className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No buyer requests</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {search ? 'Try a different search' : 'Add the first request'}
                </p>
                {canAdd && !search && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 h-7 text-xs"
                    onClick={() => setFormOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Buyer
                  </Button>
                )}
              </div>
            ) : (
              visible.map(buyer => (
                <BuyerCard
                  key={buyer.id}
                  buyer={buyer}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={() => { setEditingBuyer(buyer); setFormOpen(true); }}
                  onDelete={() => handleDelete(buyer.id)}
                  onViewDetail={() => setDetailId(buyer.id)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <BuyerFormSheet
        open={formOpen}
        buyer={editingBuyer}
        onClose={() => { setFormOpen(false); setEditingBuyer(null); }}
        onSuccess={handleFormSuccess}
      />

      <BuyerDetailSheet
        buyerId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={b => {
          setDetailId(null);
          setEditingBuyer(b);
          setFormOpen(true);
        }}
      />
    </>
  );
}