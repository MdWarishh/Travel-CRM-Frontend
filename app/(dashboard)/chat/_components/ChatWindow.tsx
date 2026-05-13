'use client';

import { MessageSquare } from 'lucide-react';
import { Conversation, Message, TypingUser } from '@/types/chat';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  typingUsers: TypingUser[];
  currentUserId: string;
  loadingMessages: boolean;
  sending: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
  onBack?: () => void;
}

export function ChatWindow({
  conversation, messages, typingUsers, currentUserId,
  loadingMessages, sending, onSend, onTyping, onBack,
}: Props) {
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 text-muted-foreground gap-4">
        <div className="h-20 w-20 rounded-2xl bg-muted/60 flex items-center justify-center">
          <MessageSquare className="h-10 w-10 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground/60">Select a conversation</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Choose from your chats on the left, or start a new one
          </p>
        </div>
      </div>
    );
  }

  const typingText = typingUsers.length > 0
    ? `${typingUsers.map(u => u.userName.split(' ')[0]).join(', ')} ${typingUsers.length === 1 ? 'is' : 'are'} typing...`
    : undefined;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        typingText={typingText}
        onBack={onBack}
      />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        loading={loadingMessages}
      />
      <MessageInput
        onSend={onSend}
        onTyping={onTyping}
        sending={sending}
      />
    </div>
  );
}