'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Shield,
  ChevronDown,
  ChevronUp,
  Save,
  Search,
  CheckCircle2,
  Users,
  RefreshCw,
  Eye,
  PenSquare,
  Plus,
  Trash2,
  BarChart3,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ticketPermissionService,
} from '@/services/ticket.service';
import { usersService } from '@/services/user.service';
import type { AgentPermission } from '@/types/ticket.types';
import { invalidatePermissionCache } from './useTicketPermission';

type PermKey = keyof Omit<AgentPermission, 'id' | 'userId' | 'user' | 'createdAt' | 'updatedAt'>;

interface PermissionSection {
  title: string;
  icon: React.ElementType;
  color: string;
  perms: { key: PermKey; label: string; icon: React.ElementType }[];
}

const SECTIONS: PermissionSection[] = [
  {
    title: 'Sellers',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    perms: [
      { key: 'canViewSellers', label: 'View', icon: Eye },
      { key: 'canAddSellers', label: 'Add', icon: Plus },
      { key: 'canEditSellers', label: 'Edit', icon: PenSquare },
      { key: 'canDeleteSellers', label: 'Delete', icon: Trash2 },
    ],
  },
  {
    title: 'Buyers',
    icon: Shield,
    color: 'text-violet-600 dark:text-violet-400',
    perms: [
      { key: 'canViewBuyers', label: 'View', icon: Eye },
      { key: 'canAddBuyers', label: 'Add', icon: Plus },
      { key: 'canEditBuyers', label: 'Edit', icon: PenSquare },
      { key: 'canDeleteBuyers', label: 'Delete', icon: Trash2 },
    ],
  },
  {
    title: 'Deals',
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    perms: [
      { key: 'canViewDeals', label: 'View', icon: Eye },
      { key: 'canAddDeals', label: 'Add', icon: Plus },
      { key: 'canEditDeals', label: 'Edit', icon: PenSquare },
      { key: 'canDeleteDeals', label: 'Delete', icon: Trash2 },
    ],
  },
  {
    title: 'Reports & Import',
    icon: BarChart3,
    color: 'text-emerald-600 dark:text-emerald-400',
    perms: [
      { key: 'canViewReports', label: 'View Reports', icon: BarChart3 },
      { key: 'canImportData', label: 'Import Data', icon: Upload },
    ],
  },
];

const ALL_PERM_KEYS: PermKey[] = [
  'canViewSellers', 'canAddSellers', 'canEditSellers', 'canDeleteSellers',
  'canViewBuyers', 'canAddBuyers', 'canEditBuyers', 'canDeleteBuyers',
  'canViewDeals', 'canAddDeals', 'canEditDeals', 'canDeleteDeals',
  'canViewReports', 'canImportData',
];

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function countEnabled(perms: Partial<AgentPermission>): number {
  return ALL_PERM_KEYS.filter(k => perms[k]).length;
}

interface AgentPermRow {
  userId: string;
  name: string;
  email: string;
  role: string;
  perms: Partial<AgentPermission>;
  isDirty: boolean;
  saving: boolean;
  open: boolean;
  existingId?: string;
}

export function PermissionsManager() {
  const [rows, setRows] = useState<AgentPermRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingAll, setSavingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [users, permsAll] = await Promise.all([
        usersService.getAll({ role: 'AGENT', limit: 100 }),
        ticketPermissionService.getAll(),
      ]);

      const permMap = new Map(permsAll.map(p => [p.userId, p]));

      setRows(
        (users.data ?? []).map(u => {
          const existing = permMap.get(u.id);
          return {
            userId: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            perms: existing ?? {},
            isDirty: false,
            saving: false,
            open: false,
            existingId: existing?.id,
          };
        })
      );
    } catch {
      toast.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = (userId: string, key: PermKey, val: boolean) => {
    setRows(prev =>
      prev.map(r =>
        r.userId === userId
          ? { ...r, perms: { ...r.perms, [key]: val }, isDirty: true }
          : r
      )
    );
  };

  const toggleAll = (userId: string, enable: boolean) => {
    const all = Object.fromEntries(ALL_PERM_KEYS.map(k => [k, enable]));
    setRows(prev =>
      prev.map(r =>
        r.userId === userId
          ? { ...r, perms: { ...r.perms, ...all }, isDirty: true }
          : r
      )
    );
  };

  const toggleSection = (userId: string, keys: PermKey[], enable: boolean) => {
    const patch = Object.fromEntries(keys.map(k => [k, enable]));
    setRows(prev =>
      prev.map(r =>
        r.userId === userId
          ? { ...r, perms: { ...r.perms, ...patch }, isDirty: true }
          : r
      )
    );
  };

  const saveRow = async (row: AgentPermRow) => {
    setRows(prev => prev.map(r => r.userId === row.userId ? { ...r, saving: true } : r));
    try {
      await ticketPermissionService.upsert({ userId: row.userId, ...row.perms });
      setRows(prev =>
        prev.map(r =>
          r.userId === row.userId ? { ...r, isDirty: false, saving: false } : r
        )
      );
      invalidatePermissionCache();
      toast.success(`Permissions saved for ${row.name}`);
    } catch {
      setRows(prev => prev.map(r => r.userId === row.userId ? { ...r, saving: false } : r));
      toast.error('Failed to save permissions');
    }
  };

  const saveAll = async () => {
    const dirty = rows.filter(r => r.isDirty);
    if (!dirty.length) { toast.info('No changes to save'); return; }
    setSavingAll(true);
    try {
      await Promise.all(dirty.map(r =>
        ticketPermissionService.upsert({ userId: r.userId, ...r.perms })
      ));
      setRows(prev => prev.map(r => ({ ...r, isDirty: false })));
      invalidatePermissionCache();
      toast.success(`Saved permissions for ${dirty.length} agent${dirty.length > 1 ? 's' : ''}`);
    } catch {
      toast.error('Some saves failed');
    } finally {
      setSavingAll(false);
    }
  };

  const filtered = rows.filter(r =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.email.toLowerCase().includes(search.toLowerCase())
  );

  const dirtyCount = rows.filter(r => r.isDirty).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Agent Permissions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Control which agents can access sellers, buyers, deals, and reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw className={cn('h-4 w-4 mr-1.5', loading && 'animate-spin')} />
            Refresh
          </Button>
          {dirtyCount > 0 && (
            <Button
              size="sm"
              onClick={saveAll}
              disabled={savingAll}
              className="gap-1.5"
            >
              <Save className="h-4 w-4" />
              Save All
              <Badge className="h-4 text-[10px] px-1 ml-0.5 bg-white/20">
                {dirtyCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          className="pl-9 h-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-3.5">
        <Shield className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">ADMIN</span> and{' '}
          <span className="font-semibold text-foreground">MANAGER</span> roles automatically have full access to all ticket features.
          These permissions only apply to <span className="font-semibold text-foreground">AGENT</span> role users.
        </p>
      </div>

      {/* Agent List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            {search ? 'No agents match your search' : 'No agents found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(row => {
            const enabled = countEnabled(row.perms);
            const total = ALL_PERM_KEYS.length;
            const allEnabled = enabled === total;

            return (
              <Collapsible
                key={row.userId}
                open={row.open}
                onOpenChange={v =>
                  setRows(prev =>
                    prev.map(r => r.userId === row.userId ? { ...r, open: v } : r)
                  )
                }
              >
                <Card className={cn(
                  'transition-all',
                  row.isDirty && 'border-primary/50 bg-primary/[0.02]'
                )}>
                  <CardHeader className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-semibold bg-muted">
                          {getInitials(row.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{row.name}</p>
                          {row.isDirty && (
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-400 text-amber-600">
                              Unsaved
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                      </div>

                      {/* Permission count badge */}
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs font-medium px-2 py-0.5 rounded-full',
                          enabled === 0
                            ? 'bg-muted text-muted-foreground'
                            : allEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        )}>
                          {enabled}/{total}
                        </span>

                        {/* Save button for dirty rows */}
                        {row.isDirty && (
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={e => { e.stopPropagation(); saveRow(row); }}
                            disabled={row.saving}
                          >
                            {row.saving ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Save className="h-3 w-3" />
                            )}
                            Save
                          </Button>
                        )}

                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            {row.open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                    </div>

                    {/* Mini permission bar */}
                    {!row.open && enabled > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2 ml-12">
                        {ALL_PERM_KEYS.filter(k => row.perms[k]).slice(0, 6).map(k => (
                          <span key={k} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            {k.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        ))}
                        {enabled > 6 && (
                          <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                            +{enabled - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4">
                      {/* Master toggle */}
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 border px-3 py-2 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={cn('h-4 w-4', allEnabled ? 'text-emerald-500' : 'text-muted-foreground')} />
                          <span className="text-sm font-medium">
                            {allEnabled ? 'Full Access Enabled' : 'Grant Full Access'}
                          </span>
                        </div>
                        <Switch
                          checked={allEnabled}
                          onCheckedChange={v => toggleAll(row.userId, v)}
                        />
                      </div>

                      {/* Sections */}
                      <div className="space-y-4">
                        {SECTIONS.map(section => {
                          const sectionEnabled = section.perms.filter(p => row.perms[p.key]).length;
                          const sectionAll = sectionEnabled === section.perms.length;
                          const SectionIcon = section.icon;

                          return (
                            <div key={section.title}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                  <SectionIcon className={cn('h-3.5 w-3.5', section.color)} />
                                  <p className="text-xs font-semibold">{section.title}</p>
                                  <span className="text-[10px] text-muted-foreground">
                                    ({sectionEnabled}/{section.perms.length})
                                  </span>
                                </div>
                                <button
                                  onClick={() => toggleSection(row.userId, section.perms.map(p => p.key), !sectionAll)}
                                  className="text-[10px] text-primary hover:underline"
                                >
                                  {sectionAll ? 'Remove all' : 'Grant all'}
                                </button>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {section.perms.map(perm => {
                                  const Icon = perm.icon;
                                  const active = !!row.perms[perm.key];
                                  return (
                                    <button
                                      key={perm.key}
                                      onClick={() => toggle(row.userId, perm.key, !active)}
                                      className={cn(
                                        'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all',
                                        active
                                          ? 'bg-primary/10 border-primary/30 text-primary'
                                          : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'
                                      )}
                                    >
                                      <Icon className="h-3 w-3 flex-shrink-0" />
                                      {perm.label}
                                      {active && (
                                        <CheckCircle2 className="h-3 w-3 ml-auto text-primary flex-shrink-0" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}