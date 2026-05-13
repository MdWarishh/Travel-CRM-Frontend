'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { PermissionProvider } from '@/hooks/usePermissions';
import { cn } from '@/utils/helpers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage before checking auth.
    // Without this guard, _hasHydrated is false on first render → isAuthenticated
    // reads as false (initial state) → premature redirect to /login on every refresh.
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Show spinner while:
  // 1. Zustand is still hydrating from localStorage (_hasHydrated = false)
  // 2. Hydrated but not authenticated (redirect in progress)
  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PermissionProvider userRole={user?.role ?? null} customRoleId={(user as any)?.customRoleId ?? null}>
      <div className="min-h-screen bg-slate-50">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Topbar sidebarCollapsed={collapsed} onMenuClick={() => setCollapsed(!collapsed)} />
        <main
          className={cn(
            'pt-16 min-h-screen transition-all duration-300',
            collapsed ? 'pl-16' : 'pl-60'
          )}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </PermissionProvider>
  );
}