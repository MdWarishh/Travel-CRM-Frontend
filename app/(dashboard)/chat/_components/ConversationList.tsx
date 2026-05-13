'use client';

import { useState } from 'react';
import { Search, MessageSquarePlus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Conversation, ChatUser } from '@/types/chat';
import { UserAvatar } from './UserAvatar';
import { NewChatDialog } from './NewChatDialog';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  conversations: Conversation[];
  activeConversationId?: string;
  currentUserId: string;
  loading: boolean;
  onSelect: (conv: Conversation) => void;
  onNewChat: (user: ChatUser) => void;
}

export function ConversationList({
  conversations, activeConversationId, currentUserId,
  loading, onSelect, onNewChat,
}: Props) {
  const [search, setSearch] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);

  const filtered = conversations.filter(conv => {
    const other = conv.participants.find(p => p.userId !== currentUserId);
    const name = conv.title || other?.user.name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Messages</h2>
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setNewChatOpen(true)}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/40 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
            <Users className="h-8 w-8 opacity-40" />
            <p className="text-sm">
              {search ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!search && (
              <Button variant="outline" size="sm" onClick={() => setNewChatOpen(true)}>
                Start a chat
              </Button>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filtered.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                currentUserId={currentUserId}
                isActive={conv.id === activeConversationId}
                onClick={() => onSelect(conv)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onSelectUser={(user) => { onNewChat(user); setNewChatOpen(false); }}
      />
    </div>
  );
}

function ConversationItem({
  conversation, currentUserId, isActive, onClick,
}: {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const other = conversation.participants.find(p => p.userId !== currentUserId);
  const lastMsg = conversation.messages?.[0];
  const isOnline = other?.user.onlineStatus?.isOnline;
  const unread = conversation.unreadCount || 0;
  const name = conversation.title || other?.user.name || 'Unknown';

  const lastMsgText = lastMsg
    ? lastMsg.messageType === 'TASK'
      ? '📋 Task shared'
      : lastMsg.messageType === 'SYSTEM'
      ? '⚙️ System message'
      : lastMsg.messageType === 'FILE'
      ? '📎 File'
      : lastMsg.messageText || ''
    : 'No messages yet';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-muted/60 text-foreground'
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          name={name}
          image={other?.user.profileImage}
          size="md"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={cn(
            'text-sm truncate',
            unread > 0 ? 'font-semibold' : 'font-medium'
          )}>
            {name}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-1">
          <p className={cn(
            'text-xs truncate',
            unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
          )}>
            {lastMsg?.senderId === currentUserId ? `You: ${lastMsgText}` : lastMsgText}
          </p>
          {unread > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] shrink-0 bg-primary">
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}