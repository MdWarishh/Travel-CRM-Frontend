'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { getInitials, roleColors, cn } from '@/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { notificationsService } from '@/services/index';
import { useState } from 'react';

interface TopbarProps {
  sidebarCollapsed: boolean;
  onMenuClick: () => void;
}

export function Topbar({ sidebarCollapsed, onMenuClick }: TopbarProps) {
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsService.getAll({ isRead: 'false', limit: '5' }),
    refetchInterval: 30000,
  });

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 gap-4 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, customers..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
            <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', user ? roleColors[user.role] : '')}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}