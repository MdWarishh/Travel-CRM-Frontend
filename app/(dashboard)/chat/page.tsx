'use client';

import { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ConversationList } from './_components/ConversationList';
import { ChatWindow } from './_components/ChatWindow';
import { ChatUser } from '@/types/chat';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// HOW TO USE:
// 1. Wrap your layout or this page with <SocketProvider token={authToken}>
// 2. Pass currentUserId from your auth context
//
// Example in your layout.tsx:
//   import { SocketProvider } from './_components/SocketProvider';
//   <SocketProvider token={session.accessToken}>
//     {children}
//   </SocketProvider>
//
// Then in this page get currentUserId from useAuth() or session
// ─────────────────────────────────────────────────────────────

interface Props {
  // Pass these from your auth context / session
  currentUserId: string;
}

function ChatPageContent({ currentUserId }: Props) {
  const {
    conversations, activeConversation, messages,
    typingUsers, loadingConvs, loadingMessages, sending,
    selectConversation, sendMessage, startConversation, handleTyping,
  } = useChat(currentUserId);

  // Mobile: track which panel is visible
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const handleSelectConversation = async (conv: typeof conversations[0]) => {
    await selectConversation(conv);
    setMobileView('chat');
  };

  const handleNewChat = async (user: ChatUser) => {
    await startConversation(user);
    setMobileView('chat');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-border shadow-sm">
      {/* LEFT PANEL — Conversation list */}
      <div className={cn(
        'w-full md:w-80 lg:w-96 shrink-0 flex flex-col',
        // Mobile: hide when chat is open
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      )}>
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversation?.id}
          currentUserId={currentUserId}
          loading={loadingConvs}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
        />
      </div>

      {/* DIVIDER */}
      <div className="hidden md:block w-px bg-border shrink-0" />

      {/* RIGHT PANEL — Chat window */}
      <div className={cn(
        'flex-1 flex min-w-0',
        // Mobile: hide when list is shown
        mobileView === 'list' ? 'hidden md:flex' : 'flex'
      )}>
        <ChatWindow
          conversation={activeConversation}
          messages={messages}
          typingUsers={typingUsers}
          currentUserId={currentUserId}
          loadingMessages={loadingMessages}
          sending={sending}
          onSend={sendMessage}
          onTyping={handleTyping}
          onBack={() => setMobileView('list')}
        />
      </div>
    </div>
  );
}

// ─── Page Export ─────────────────────────────────────────────
// Replace `currentUserId` with your actual auth hook
// e.g. const { user } = useAuth(); → currentUserId={user.id}

export default function ChatsPage() {
  // TODO: Replace with your actual auth — e.g. useAuth() or useSession()
  // import { useAuth } from '@/hooks/useAuth';
  // const { user } = useAuth();
  // const currentUserId = user?.id ?? '';

  const currentUserId = 'YOUR_CURRENT_USER_ID'; // ← replace this

  return <ChatPageContent currentUserId={currentUserId} />;
}