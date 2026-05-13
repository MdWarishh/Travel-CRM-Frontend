'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { ticketPermissionService } from '@/services/ticket.service';
import type { AgentPermission } from '@/types/ticket.types';

type PermissionKey = keyof Omit<AgentPermission, 'id' | 'userId' | 'user' | 'createdAt' | 'updatedAt'>;

let cachedPerms: AgentPermission | null = null;
let fetchPromise: Promise<void> | null = null;

export function useTicketPermission() {
  const { user } = useAuthStore();
  const [perms, setPerms] = useState<AgentPermission | null>(cachedPerms);

  const isAdminOrManager =
    user?.role === 'ADMIN' || user?.role === 'MANAGER';

  useEffect(() => {
    if (isAdminOrManager) return; // admins bypass all
    if (cachedPerms) { setPerms(cachedPerms); return; }
    if (!fetchPromise) {
      fetchPromise = ticketPermissionService
        .getForUser(user!.id)
        .then(p => { cachedPerms = p; setPerms(p); })
        .catch(() => { fetchPromise = null; });
    } else {
      fetchPromise.then(() => setPerms(cachedPerms));
    }
  }, [isAdminOrManager, user?.id]);

  const can = (key: PermissionKey): boolean => {
    if (isAdminOrManager) return true;
    if (!perms) return false;
    return !!perms[key];
  };

  return { can, perms, isAdminOrManager };
}

/** Call this to bust the cache after permissions update */
export function invalidatePermissionCache() {
  cachedPerms = null;
  fetchPromise = null;
}