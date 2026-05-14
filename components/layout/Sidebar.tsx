'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCheck, Map, BookOpen,
  CreditCard, Building2, BarChart3,
  Plane, ChevronLeft, ChevronRight, LogOut, Settings,
  ChevronDown, Globe, Sliders, Trash2, LayoutTemplate,
  MessageSquare, CheckSquare, ReceiptText, Ticket,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAuthStore } from '@/store/auth.store';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionModule } from '@/types/users';
import { Role } from '@/types';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  module: PermissionModule;
  roles: Role[];
  badge?: string;
}

interface SettingsChild {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
}

// ─── Nav Config ───────────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { href: '/dashboard',       label: 'Dashboard',       icon: LayoutDashboard, module: 'dashboard',  roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/leads',           label: 'Leads',           icon: UserCheck,       module: 'leads',       roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/customers',       label: 'Customers',       icon: Users,           module: 'customers',   roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/itineraries',     label: 'Itineraries',     icon: Map,             module: 'itinerary',   roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/bookings',        label: 'Bookings',        icon: BookOpen,        module: 'bookings',    roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/invoice',         label: 'Invoices',        icon: ReceiptText,     module: 'payments',    roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/flight-tickets',  label: 'Flight Tickets',  icon: Ticket,          module: 'bookings',    roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/payments',        label: 'Payments',        icon: CreditCard,      module: 'payments',    roles: ['ADMIN', 'MANAGER'] },
  { href: '/chat',            label: 'Chat',            icon: MessageSquare,   module: 'chat',        roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/tasks',           label: 'Tasks',           icon: CheckSquare,     module: 'tasks',       roles: ['ADMIN', 'MANAGER', 'AGENT'] },
  { href: '/vendors',         label: 'Vendors',         icon: Building2,       module: 'vendors',     roles: ['ADMIN', 'MANAGER'] },
  { href: '/reports',         label: 'Reports',         icon: BarChart3,       module: 'reports',     roles: ['ADMIN', 'MANAGER'] },
  { href: '/users',           label: 'Users',           icon: Users,           module: 'users',       roles: ['ADMIN'] },
];

const settingsChildren: SettingsChild[] = [
  { href: '/settings/lead-stages', label: 'Lead Settings', icon: Sliders,        roles: ['ADMIN', 'MANAGER'] },
];

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  href, label, icon: Icon, active, collapsed, badge,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; collapsed: boolean; badge?: string;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[11.5px] font-medium tracking-wide transition-all duration-150 group',
        active
          ? 'bg-gradient-to-r from-blue-600/90 to-blue-500/80 text-white shadow-[0_2px_12px_rgba(37,99,235,0.35)]'
          : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]',
        collapsed && 'justify-center px-2 py-2'
      )}
    >
      {/* Active left accent bar */}
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-blue-300/80" />
      )}

      <Icon className={cn('flex-shrink-0 transition-transform duration-150 group-hover:scale-105', collapsed ? 'w-[15px] h-[15px]' : 'w-3.5 h-3.5')} />

      {!collapsed && (
        <span className="flex-1 leading-none">{label}</span>
      )}

      {!collapsed && badge && (
        <span className="ml-auto text-[9px] font-bold bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full leading-none">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ─── Divider Label ────────────────────────────────────────────────────────────

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="my-1.5 mx-auto w-4 h-px bg-slate-700/60" />;
  return (
    <p className="px-2.5 pt-3 pb-1 text-[9px] font-semibold tracking-[0.12em] uppercase text-slate-600 select-none">
      {label}
    </p>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { hasModule, isAdmin, hasCustomRole, isLoading: permsLoading } = usePermissions();

  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith('/settings'));

  const filteredNav = navItems.filter((item) => {
    if (!user) return false;
    if (isAdmin) return item.roles.includes(user.role as Role);
    if (hasCustomRole) return hasModule(item.module);
    if (!item.roles.includes(user.role as Role)) return false;
    return hasModule(item.module);
  });

  const filteredSettings = settingsChildren.filter(
    (item) => user && item.roles.includes(user.role as Role)
  );

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  const isSettingsActive = pathname.startsWith('/settings');

  // Group nav items
  const coreItems   = filteredNav.filter(i => ['dashboard','leads','customers'].some(h => i.href.startsWith(`/${h}`)));
  const opsItems    = filteredNav.filter(i => ['itineraries','bookings','invoice','flight-tickets'].some(h => i.href.startsWith(`/${h}`)));
  const finItems    = filteredNav.filter(i => ['payments','chat','tasks'].some(h => i.href.startsWith(`/${h}`)));
  const adminItems  = filteredNav.filter(i => ['vendors','reports','users'].some(h => i.href.startsWith(`/${h}`)));

  const groups = [
    { label: 'Core', items: coreItems },
    { label: 'Operations', items: opsItems },
    { label: 'Finance & Comms', items: finItems },
    { label: 'Admin', items: adminItems },
  ].filter(g => g.items.length > 0);

  // User initials
  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'U';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen flex flex-col transition-all duration-300 z-40',
        'bg-[#0d1117] border-r border-white/[0.05]',
        // Subtle noise texture via box-shadow layers
        collapsed ? 'w-[58px]' : 'w-[210px]'
      )}
      style={{
        backgroundImage: 'radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.06) 0%, transparent 60%)',
      }}
    >

      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center h-14 border-b border-white/[0.05] px-3 flex-shrink-0',
        collapsed ? 'justify-center' : 'gap-2.5'
      )}>
        <div className="relative w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
          <Plane className="w-3.5 h-3.5 text-white" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-[#0d1117]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-white leading-none tracking-tight">Travel CRM</p>
            <p className="text-[9.5px] text-slate-500 capitalize mt-0.5 tracking-wide">{user?.role?.toLowerCase()} workspace</p>
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {permsLoading && !isAdmin ? (
          <div className="space-y-1 px-1 mt-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-7 rounded-lg bg-white/[0.04] animate-pulse"
                style={{ opacity: 1 - i * 0.1 }}
              />
            ))}
          </div>
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.label}>
                <SectionLabel label={group.label} collapsed={collapsed} />
                <div className="space-y-[2px]">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={isActive(item.href)}
                      collapsed={collapsed}
                      badge={item.badge}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* ── Settings ── */}
            {filteredSettings.length > 0 && (
              <div>
                <SectionLabel label="Settings" collapsed={collapsed} />
                <div className="space-y-[2px]">
                  <button
                    onClick={() => !collapsed && setSettingsOpen(p => !p)}
                    title={collapsed ? 'Settings' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[11.5px] font-medium tracking-wide transition-all duration-150',
                      isSettingsActive
                        ? 'text-slate-100 bg-white/[0.06]'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]',
                      collapsed && 'justify-center px-2 py-2'
                    )}
                  >
                    <Settings className={cn('flex-shrink-0', collapsed ? 'w-[15px] h-[15px]' : 'w-3.5 h-3.5')} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left leading-none">Settings</span>
                        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200 text-slate-600', settingsOpen && 'rotate-180')} />
                      </>
                    )}
                  </button>

                  {/* Expanded */}
                  {!collapsed && settingsOpen && (
                    <div className="ml-2.5 pl-3 border-l border-white/[0.07] space-y-[2px] mt-0.5">
                      {filteredSettings.map((child) => {
                        const Icon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              'flex items-center gap-2 px-2 py-[6px] rounded-lg text-[11px] font-medium tracking-wide transition-all duration-150',
                              active
                                ? 'bg-blue-600/80 text-white'
                                : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                            )}
                          >
                            <Icon className="w-3 h-3 flex-shrink-0" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Collapsed icons */}
                  {collapsed && settingsOpen && (
                    <div className="space-y-[2px]">
                      {filteredSettings.map((child) => {
                        const Icon = child.icon;
                        const active = isActive(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            title={child.label}
                            className={cn(
                              'flex items-center justify-center w-full py-2 rounded-lg transition-all duration-150',
                              active ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]'
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </nav>

      {/* ── User + Collapse ── */}
      <div className="border-t border-white/[0.05] p-2 space-y-[3px] flex-shrink-0">

        {/* User info */}
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-200 truncate leading-none">{user?.name}</p>
              <p className="text-[9.5px] text-slate-600 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[9px] font-bold text-white shadow-sm" title={user?.name}>
              {initials}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => { clearAuth(); window.location.href = '/login'; }}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[11px] font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150',
            collapsed && 'justify-center px-2 py-2'
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn('flex-shrink-0', collapsed ? 'w-3.5 h-3.5' : 'w-3 h-3')} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2.5 w-full px-2.5 py-[7px] rounded-lg text-[11px] font-medium text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-150',
            collapsed && 'justify-center px-2 py-2'
          )}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <><ChevronLeft className="w-3 h-3" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}