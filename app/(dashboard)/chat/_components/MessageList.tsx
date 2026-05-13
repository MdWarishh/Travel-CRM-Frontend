'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Message, TypingUser } from '@/types/chat';
import { MessageBubble } from './MessageBubble';
import { isSameDay } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface Props {
  messages: Message[];
  currentUserId: string;
  typingUsers: TypingUser[];
  loading: boolean;
}

export function MessageList({ messages, currentUserId, typingUsers, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (loading) {
    return (
      <div className="flex-1 px-4 py-4 space-y-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
            <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-48' : 'w-36'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
        <div className="h-14 w-14 rounded-full bg-muted/60 flex items-center justify-center">
          <MessageSquare className="h-7 w-7 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">No messages yet</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2" ref={scrollAreaRef}>
      <div className="space-y-0.5">
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUserId;
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];

          // Show avatar only on last consecutive message from same sender
          const showAvatar = !nextMsg || nextMsg.senderId !== msg.senderId;

          // Date divider logic
          const showDateDivider = !prevMsg ||
            !isSameDay(new Date(prevMsg.createdAt), new Date(msg.createdAt));

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              showDateDivider={showDateDivider}
              dividerDate={msg.createdAt}
            />
          );
        })}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-2 items-end mb-1">
            <div className="h-7 w-7 shrink-0" />
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {typingUsers.map(u => u.userName.split(' ')[0]).join(', ')} typing...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}