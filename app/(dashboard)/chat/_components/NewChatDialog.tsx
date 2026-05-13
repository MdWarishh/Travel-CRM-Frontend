'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatUser } from '@/types/chat';
import { chatService } from '@/services/chat.service';
import { UserAvatar } from './UserAvatar';
import { useDebounce } from '@/hooks/useDebounce'; // standard debounce hook
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (user: ChatUser) => void;
}

export function NewChatDialog({ open, onOpenChange, onSelectUser }: Props) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setUsers([]); return; }
    setLoading(true);
    chatService.searchUsers(debouncedQuery)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (user: ChatUser) => {
    onSelectUser(user);
    setQuery('');
    setUsers([]);
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-amber-100 text-amber-700',
    AGENT: 'bg-blue-100 text-blue-700',
    VENDOR: 'bg-green-100 text-green-700',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <DialogTitle className="text-base">New Message</DialogTitle>
        </DialogHeader>

        <div className="px-4 py-3 border-b">
          <div className="relative">
            {loading
              ? <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
              : <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            }
            <Input
              autoFocus
              placeholder="Search by name or email..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/40 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <ScrollArea className="max-h-72">
          {users.length === 0 && query && !loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No users found for &ldquo;{query}&rdquo;
            </p>
          ) : users.length === 0 && !query ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Type to search team members
            </p>
          ) : (
            <div className="p-2 space-y-0.5">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="relative shrink-0">
                    <UserAvatar name={user.name} image={user.profileImage} size="md" />
                    {user.onlineStatus?.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 border-0 ${roleColors[user.role] || 'bg-muted text-muted-foreground'}`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  {user.onlineStatus?.isOnline ? (
                    <span className="text-[10px] text-green-600 font-medium shrink-0">Online</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground shrink-0">Offline</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}