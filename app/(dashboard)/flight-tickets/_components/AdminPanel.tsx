'use client';

import { useState } from 'react';
import { Zap, Link2, Shield, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { useTicketMatches, useTicketDeals, useConnectDeal, ticketKeys } from './useTicketData';
import type { TicketMatch, TicketDeal, AdminTab } from '@/types/ticket.types';
import { MatchCard } from './MatchCard';
import { DealCard } from './DealCard';
import { DealDetailDialog } from './DealDetailDialog';
import { DealFormDialog } from './DealFormDialog';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';
import { toast } from 'sonner';

interface Props {
  onStatsRefresh: () => void;
}

export function AdminPanel({ onStatsRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('matches');
  const [selectedDeal, setSelectedDeal] = useState<TicketDeal | null>(null);
  const [dealFormOpen, setDealFormOpen] = useState(false);
  const [prefillMatch, setPrefillMatch] = useState<TicketMatch | null>(null);

  const { user } = useAuthStore();
  const { can } = useTicketPermission();
  const qc = useQueryClient();

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canViewDeals = can('canViewDeals');
  const canAddDeals = can('canAddDeals');

  const { data: matches = [], isLoading: loadingMatches } = useTicketMatches();
  const { data: deals = [], isLoading: loadingDeals } = useTicketDeals();
  const connectDeal = useConnectDeal();

  const handleConnectDeal = async (match: TicketMatch) => {
    if (!canAddDeals) return;
    try {
      await connectDeal.mutateAsync({
        sellerId: match.seller.id,
        buyerId: match.buyer.id,
        seatsBooked: Math.min(match.seller.seatsAvailable, match.buyer.seatsRequired),
        sellerCostPerSeat: match.seller.pricePerSeat,
        buyerPricePerSeat: match.buyer.budgetPerSeat,
      });
      setActiveTab('deals');
      onStatsRefresh();
    } catch {}
  };

  const handleOpenDealForm = (match?: TicketMatch) => {
    setPrefillMatch(match ?? null);
    setDealFormOpen(true);
  };

  const handleDealUpdate = (updated: TicketDeal) => {
    qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
    setSelectedDeal(updated);
    onStatsRefresh();
  };

  const handleDealDelete = (id: string) => {
    qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
    setSelectedDeal(null);
    onStatsRefresh();
  };

  const handleDealFormSuccess = (deal: TicketDeal) => {
    qc.invalidateQueries({ queryKey: ['ticket', 'deals'] });
    qc.invalidateQueries({ queryKey: ticketKeys.matches });
    setDealFormOpen(false);
    setPrefillMatch(null);
    setActiveTab('deals');
    onStatsRefresh();
    toast.success('Deal connected!');
  };

  const pendingDeals = deals.filter(d => d.status === 'PENDING' || d.status === 'CONNECTED').length;

  if (!isAdminOrManager && !canViewDeals) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="space-y-2">
          <Shield className="h-8 w-8 mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Admin panel not accessible</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b bg-background flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 dark:bg-amber-900/40">
              <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">Admin Panel</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {matches.length} matches · {deals.length} deals
              </p>
            </div>
          </div>
          {canAddDeals && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={() => handleOpenDealForm()}
            >
              <Plus className="h-3.5 w-3.5" />
              New Deal
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as AdminTab)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-3 pt-2 border-b">
            <TabsList className="w-full h-8">
              <TabsTrigger value="matches" className="flex-1 text-xs gap-1.5">
                <Zap className="h-3 w-3" />
                Matches
                {matches.length > 0 && (
                  <Badge variant="secondary" className="h-4 text-[10px] px-1.5 min-w-[18px]">
                    {matches.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex-1 text-xs gap-1.5">
                <Link2 className="h-3 w-3" />
                Deals
                {pendingDeals > 0 && (
                  <Badge className="h-4 text-[10px] px-1.5 min-w-[18px] bg-amber-500 hover:bg-amber-500">
                    {pendingDeals}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Matches Tab */}
          <TabsContent value="matches" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {loadingMatches ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-3 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-7 w-full mt-2" />
                    </div>
                  ))
                ) : matches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Zap className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No matches yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px]">
                      Matches appear when routes, dates & times align
                    </p>
                  </div>
                ) : (
                  matches.map((match, i) => (
                    <MatchCard
                      key={`${match.seller.id}-${match.buyer.id}-${i}`}
                      match={match}
                      canConnect={canAddDeals}
                      onConnect={() => handleConnectDeal(match)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {loadingDeals ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border p-3 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-full" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </div>
                  ))
                ) : deals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <Link2 className="h-10 w-10 text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No deals yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Connect a match or add manually
                    </p>
                    {canAddDeals && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 h-7 text-xs gap-1"
                        onClick={() => handleOpenDealForm()}
                      >
                        <Plus className="h-3 w-3" /> New Deal
                      </Button>
                    )}
                  </div>
                ) : (
                  deals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      onClick={() => setSelectedDeal(deal)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Deal Detail Dialog (Admin premium view) */}
      <DealDetailDialog
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
        onUpdate={handleDealUpdate}
        onDelete={handleDealDelete}
      />

      {/* Manual Deal Form Dialog */}
      <DealFormDialog
        open={dealFormOpen}
        prefillMatch={prefillMatch}
        onClose={() => { setDealFormOpen(false); setPrefillMatch(null); }}
        onSuccess={handleDealFormSuccess}
      />
    </>
  );
}