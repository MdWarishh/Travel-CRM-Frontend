'use client';

import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Conversation } from '@/types/chat';
import { UserAvatar } from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  conversation: Conversation;
  currentUserId: string;
  typingText?: string;
  onBack?: () => void;
}

export function ChatHeader({ conversation, currentUserId, typingText, onBack }: Props) {
  const other = conversation.participants.find(p => p.userId !== currentUserId);
  const name = conversation.title || other?.user.name || 'Unknown';
  const isOnline = other?.user.onlineStatus?.isOnline;
  const lastSeen = other?.user.onlineStatus?.lastSeen;

  const statusText = typingText
    ? typingText
    : isOnline
    ? 'Online'
    : lastSeen
    ? `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
    : 'Offline';

  const contextTag = conversation.booking
    ? `Booking · ${conversation.booking.customer.name}`
    : conversation.lead
    ? `Lead · ${conversation.lead.name}`
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
      {onBack && (
        <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      <div className="relative shrink-0">
        <UserAvatar name={name} image={other?.user.profileImage} size="lg" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground truncate">{name}</h3>
          {contextTag && (
            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full shrink-0">
              {contextTag}
            </span>
          )}
        </div>
        <p className={cn(
          'text-xs truncate',
          typingText
            ? 'text-primary animate-pulse'
            : isOnline
            ? 'text-green-600'
            : 'text-muted-foreground'
        )}>
          {statusText}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            {conversation.bookingId && (
              <DropdownMenuItem
                onClick={() => window.open(`/bookings/${conversation.bookingId}`, '_blank')}
              >
                Open booking
              </DropdownMenuItem>
            )}
            {conversation.leadId && (
              <DropdownMenuItem
                onClick={() => window.open(`/leads/${conversation.leadId}`, '_blank')}
              >
                Open lead
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">Clear chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}