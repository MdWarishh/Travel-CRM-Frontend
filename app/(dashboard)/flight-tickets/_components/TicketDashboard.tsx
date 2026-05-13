'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { useTicketPermission } from './useTicketPermission';
import { useTicketStats, ticketKeys } from './useTicketData';
import { StatsBar } from './StatsBar';
import { SellerColumn } from './SellerColumn';
import { BuyerColumn } from './BuyerColumn';
import { AdminPanel } from './AdminPanel';
import { cn } from '@/lib/utils';

// Socket integration — non-blocking, works without socket
let socket: any = null;
try {
  const { getSocket } = require('@/lib/socket');
  socket = getSocket?.();
} catch {}

export function TicketDashboard() {
  const { user } = useAuthStore();
  const { can, isAdminOrManager } = useTicketPermission();
  const qc = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useTicketStats();

  const canViewSellers = can('canViewSellers');
  const canViewBuyers  = can('canViewBuyers');
  const canViewDeals   = can('canViewDeals');

  const showSellers = canViewSellers;
  const showBuyers  = canViewBuyers;
  const showAdmin   = isAdminOrManager || canViewDeals;

  // Socket: refresh affected queries on real-time events
  const invalidateAll = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['ticket'] });
  }, [qc]);

  useEffect(() => {
    if (!socket) return;

    const handlers: Record<string, () => void> = {
      stats_updated:       () => qc.invalidateQueries({ queryKey: ticketKeys.stats }),
      matches_updated:     () => qc.invalidateQueries({ queryKey: ticketKeys.matches }),
      seller_created:      () => { qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); },
      seller_updated:      () => qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] }),
      seller_deleted:      () => { qc.invalidateQueries({ queryKey: ['ticket', 'sellers'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); },
      buyer_created:       () => { qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); },
      buyer_updated:       () => qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] }),
      buyer_deleted:       () => { qc.invalidateQueries({ queryKey: ['ticket', 'buyers'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); },
      deal_created:        () => { qc.invalidateQueries({ queryKey: ['ticket', 'deals'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); qc.invalidateQueries({ queryKey: ticketKeys.matches }); },
      deal_updated:        () => qc.invalidateQueries({ queryKey: ['ticket', 'deals'] }),
      deal_deleted:        () => { qc.invalidateQueries({ queryKey: ['ticket', 'deals'] }); qc.invalidateQueries({ queryKey: ticketKeys.stats }); },
      bulk_import_complete: invalidateAll,
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [qc, invalidateAll]);

  const refreshStats = useCallback(() => {
    qc.invalidateQueries({ queryKey: ticketKeys.stats });
    qc.invalidateQueries({ queryKey: ticketKeys.matches });
  }, [qc]);

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <StatsBar stats={stats} loading={statsLoading} />

      {/* Column Layout */}
      <div className={cn(
        'flex flex-1 overflow-hidden',
        'divide-x',
      )}>
        {/* Sellers Column */}
        {showSellers && (
          <SellerColumn onStatsRefresh={refreshStats} />
        )}

        {/* Buyers Column */}
        {showBuyers && (
          <BuyerColumn onStatsRefresh={refreshStats} />
        )}

        {/* Admin Panel — Matches + Deals */}
        {showAdmin && (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <AdminPanel onStatsRefresh={refreshStats} />
          </div>
        )}

        {/* Fallback: no access */}
        {!showSellers && !showBuyers && !showAdmin && (
          <div className="flex-1 flex items-center justify-center p-12 text-center">
            <div className="space-y-2">
              <div className="text-4xl">✈️</div>
              <p className="text-sm font-medium text-muted-foreground">No access configured</p>
              <p className="text-xs text-muted-foreground/70">
                Contact your admin to get permissions for the flight ticket module
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}