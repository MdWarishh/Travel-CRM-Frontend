'use client';

import { useState } from 'react';
import { Plane, BarChart3, Upload, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveView } from '@/types/ticket.types';
import { TicketDashboard } from './_components/TicketDashboard';
import { ReportsPage } from './_components/ReportsPage';
import { ImportDialog } from './_components/ImportDialog';
import { PermissionsManager } from './_components/PermissionsManager';
import { useAuthStore } from '@/store/auth.store';

export default function FlightTicketsPage() {
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [importOpen, setImportOpen] = useState(false);
  const { user } = useAuthStore();

  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="flex flex-col h-full min-h-screen bg-background">
      {/* ── Top Nav Bar ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            {activeView !== 'main' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-1"
                onClick={() => setActiveView('main')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">
                Flight Tickets
                {activeView !== 'main' && (
                  <span className="text-muted-foreground font-normal ml-2">
                    / {activeView === 'reports' ? 'Revenue Reports' : activeView === 'import' ? 'Bulk Import' : 'Permissions'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {activeView === 'main' && isAdminOrManager && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setActiveView('reports')}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Reports
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setImportOpen(true)}
              >
                <Upload className="h-3.5 w-3.5" />
                Import
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setActiveView('permissions')}
              >
                <Shield className="h-3.5 w-3.5" />
                Permissions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1">
        {activeView === 'main' && <TicketDashboard />}
        {activeView === 'reports' && <ReportsPage />}
        {activeView === 'permissions' && isAdminOrManager && <PermissionsManager />}
      </div>

      {/* ── Import Dialog ────────────────────────────────────────────────── */}
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}