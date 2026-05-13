/**
 * usePermissions — permission-based access control hook
 *
 * Usage:
 *   const { can, isAdmin, hasModule } = usePermissions();
 *   if (!can('leads', 'view')) return <AccessDenied />;
 */

'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { profileService } from '@/services/user.service';
import { RolePermission, PermissionModule, PermissionAction, SystemRole } from '@/types/users';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PermissionContextValue {
  permissions: RolePermission[];
  role: SystemRole | null;
  isLoading: boolean;
  /** Check if user can perform `action` on `module` */
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  /** Check if user has ANY permission on a module (used for sidebar visibility) */
  hasModule: (module: PermissionModule) => boolean;
  /** True for ADMIN — admins bypass all permission checks */
  isAdmin: boolean;
  /** True if user has a custom role assigned — sidebar uses this to bypass role guard */
  hasCustomRole: boolean;
  /** Reload permissions (call after role/permission changes) */
  reload: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const PermissionContext = createContext<PermissionContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface PermissionProviderProps {
  children: ReactNode;
  /** Pass the logged-in user's role — fetched from your auth store/hook */
  userRole: SystemRole | null;
  /** Pass customRoleId so provider knows user has custom permissions */
  customRoleId?: string | null;
}

export function PermissionProvider({ children, userRole, customRoleId }: PermissionProviderProps) {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userRole === 'ADMIN';
  const hasCustomRole = !!customRoleId;

  const load = useCallback(async () => {
    // ADMINs have all permissions — no need to fetch
    if (!userRole || isAdmin) {
      setPermissions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const perms = await profileService.getPermissions();
      setPermissions(perms);
    } catch {
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [userRole, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const can = useCallback(
    (module: PermissionModule, action: PermissionAction): boolean => {
      // Admin always allowed
      if (isAdmin) return true;
      const perm = permissions.find((p) => p.module === module && p.action === action);
      return perm?.allowed === true;
    },
    [permissions, isAdmin]
  );

  const hasModule = useCallback(
    (module: PermissionModule): boolean => {
      if (isAdmin) return true;
      return permissions.some((p) => p.module === module && p.allowed);
    },
    [permissions, isAdmin]
  );

  return (
    <PermissionContext.Provider
      value={{ permissions, role: userRole, isLoading, can, hasModule, isAdmin, hasCustomRole, reload: load }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used inside <PermissionProvider>');
  return ctx;
}

// ─── Gate Component ───────────────────────────────────────────────────────────
// Wrap any UI section that should only render for users with a given permission.
//
// <PermissionGate module="leads" action="create">
//   <CreateLeadButton />
// </PermissionGate>

interface GateProps {
  module: PermissionModule;
  action: PermissionAction;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ module, action, fallback = null, children }: GateProps) {
  const { can, isLoading } = usePermissions();
  if (isLoading) return null;
  return can(module, action) ? <>{children}</> : <>{fallback}</>;
}

// ─── Access Denied Page ───────────────────────────────────────────────────────

export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-900">Access Denied</p>
      <p className="mt-1 text-sm text-gray-500">
        {message ?? "You don't have permission to view this page."}
      </p>
    </div>
  );
}