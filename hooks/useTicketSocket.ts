'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  TicketSeller,
  TicketBuyer,
  TicketDeal,
  TicketMatch,
  TicketDashboardStats,
} from '@/types/ticket.types';

interface UseTicketSocketOptions {
  onSellerAdded?:    (seller: TicketSeller)      => void;
  onSellerUpdated?:  (seller: TicketSeller)      => void;
  onSellerDeleted?:  (sellerId: string)          => void;
  onBuyerAdded?:     (buyer: TicketBuyer)        => void;
  onBuyerUpdated?:   (buyer: TicketBuyer)        => void;
  onBuyerDeleted?:   (buyerId: string)           => void;
  onMatchesUpdated?: (matches: TicketMatch[])    => void;
  onDealCreated?:    (deal: TicketDeal)          => void;
  onDealUpdated?:    (deal: TicketDeal)          => void;
  onDealDeleted?:    (dealId: string)            => void;
  onStatsUpdated?:   (stats: TicketDashboardStats) => void;
}

export const useTicketSocket = (options: UseTicketSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref fresh without re-subscribing
  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('token') ?? sessionStorage.getItem('token')
        : null;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? '', {
      auth:          { token },
      transports:    ['websocket'],
      reconnection:  true,
      reconnectionDelay:     1000,
      reconnectionAttempts:  10,
    });

    socketRef.current = socket;

    // ─── Event bindings ───────────────────────────────────────────────────────

    socket.on('seller_added',    ({ seller }: { seller: TicketSeller }) =>
      optionsRef.current.onSellerAdded?.(seller));

    socket.on('seller_updated',  ({ seller }: { seller: TicketSeller }) =>
      optionsRef.current.onSellerUpdated?.(seller));

    socket.on('seller_deleted',  ({ sellerId }: { sellerId: string }) =>
      optionsRef.current.onSellerDeleted?.(sellerId));

    socket.on('buyer_added',     ({ buyer }: { buyer: TicketBuyer }) =>
      optionsRef.current.onBuyerAdded?.(buyer));

    socket.on('buyer_updated',   ({ buyer }: { buyer: TicketBuyer }) =>
      optionsRef.current.onBuyerUpdated?.(buyer));

    socket.on('buyer_deleted',   ({ buyerId }: { buyerId: string }) =>
      optionsRef.current.onBuyerDeleted?.(buyerId));

    socket.on('matches_updated', ({ matches }: { matches: TicketMatch[] }) =>
      optionsRef.current.onMatchesUpdated?.(matches));

    socket.on('deal_created',    ({ deal }: { deal: TicketDeal }) =>
      optionsRef.current.onDealCreated?.(deal));

    socket.on('deal_updated',    ({ deal }: { deal: TicketDeal }) =>
      optionsRef.current.onDealUpdated?.(deal));

    socket.on('deal_deleted',    ({ dealId }: { dealId: string }) =>
      optionsRef.current.onDealDeleted?.(dealId));

    socket.on('stats_updated',   (stats: TicketDashboardStats) =>
      optionsRef.current.onStatsUpdated?.(stats));

    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return socketRef.current;
};