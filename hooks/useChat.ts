'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket, socketEmit } from '@/lib/socket';
import { chatService } from '@/services/chat.service';
import {
  Conversation, Message, ChatUser, TypingUser,
  SocketNewMessageEvent, SocketMessagesReadEvent, SocketTypingEvent,
} from '@/types/chat';
import { toast } from 'sonner';

export function useChat(currentUserId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  // ─── Load Conversations ──────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConvs(true);
      const data = await chatService.getConversations();
      setConversations(data);
    } catch {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // ─── Select Conversation ─────────────────────────────────────
  const selectConversation = useCallback(async (conv: Conversation) => {
    // Leave previous room
    if (activeConversation) {
      socketEmit.leaveConversation(activeConversation.id);
    }

    setActiveConversation(conv);
    setMessages([]);
    setTypingUsers([]);
    setLoadingMessages(true);

    try {
      const msgs = await chatService.getMessages(conv.id);
      setMessages(msgs);
      // Mark as read
      socketEmit.markRead(conv.id);
      chatService.markAsRead(conv.id);
      // Update unread count in list
      setConversations(prev =>
        prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
      );
      // Join socket room
      socketEmit.joinConversation(conv.id);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversation]);

  // ─── Send Message ────────────────────────────────────────────
  const sendMessage = useCallback(async (text: string) => {
    if (!activeConversation || !text.trim() || sending) return;
    setSending(true);
    socketEmit.typingStop(activeConversation.id);
    try {
      const msg = await chatService.sendMessage(activeConversation.id, {
        messageText: text.trim(),
        messageType: 'TEXT',
      });
      setMessages(prev => [...prev, msg]);
      setConversations(prev =>
        prev.map(c => c.id === activeConversation.id
          ? { ...c, lastMessageAt: msg.createdAt, messages: [msg] }
          : c
        ).sort((a, b) =>
          new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        )
      );
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [activeConversation, sending]);

  // ─── Start New Conversation ───────────────────────────────────
  const startConversation = useCallback(async (user: ChatUser) => {
    try {
      const conv = await chatService.createOrGetConversation({ participantId: user.id });
      const exists = conversations.find(c => c.id === conv.id);
      if (!exists) setConversations(prev => [conv, ...prev]);
      await selectConversation(conv);
      return conv;
    } catch {
      toast.error('Failed to start conversation');
    }
  }, [conversations, selectConversation]);

  // ─── Typing ──────────────────────────────────────────────────
  const handleTyping = useCallback(() => {
    if (!activeConversation) return;
    socketEmit.typingStart(activeConversation.id);
    clearTimeout(typingTimeouts.current[activeConversation.id]);
    typingTimeouts.current[activeConversation.id] = setTimeout(() => {
      socketEmit.typingStop(activeConversation.id);
    }, 2000);
  }, [activeConversation]);

  // ─── Socket Events ───────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onNewMessage = ({ conversationId, message }: SocketNewMessageEvent) => {
      if (activeConversation?.id === conversationId) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev;
          return [...prev, message];
        });
        socketEmit.markRead(conversationId);
        chatService.markAsRead(conversationId);
      } else {
        setConversations(prev =>
          prev.map(c => c.id === conversationId
            ? { ...c, unreadCount: (c.unreadCount || 0) + 1, messages: [message], lastMessageAt: message.createdAt }
            : c
          )
        );
        if (message.senderId !== currentUserId) {
          toast(`💬 ${message.sender.name}`, {
            description: message.messageText?.slice(0, 60) || 'Sent an attachment',
          });
        }
      }
      // Resort conversations
      setConversations(prev =>
        [...prev].sort((a, b) =>
          new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        )
      );
    };

    const onMessagesRead = ({ conversationId, userId, messageIds }: SocketMessagesReadEvent) => {
      if (activeConversation?.id === conversationId && userId !== currentUserId) {
        setMessages(prev =>
          prev.map(m => messageIds.includes(m.id) ? { ...m, status: 'READ' } : m)
        );
      }
    };

    const onUserTyping = ({ conversationId, userId, userName }: SocketTypingEvent) => {
      if (activeConversation?.id === conversationId && userId !== currentUserId) {
        setTypingUsers(prev => {
          if (prev.find(u => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        });
      }
    };

    const onUserStoppedTyping = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (activeConversation?.id === conversationId) {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
      setConversations(prev =>
        prev.map(c => ({
          ...c,
          participants: c.participants.map(p =>
            p.userId === userId
              ? { ...p, user: { ...p.user, onlineStatus: { isOnline: true, lastSeen: new Date().toISOString() } } }
              : p
          ),
        }))
      );
    };

    const onUserOffline = ({ userId, lastSeen }: { userId: string; lastSeen: string }) => {
      setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s; });
      setConversations(prev =>
        prev.map(c => ({
          ...c,
          participants: c.participants.map(p =>
            p.userId === userId
              ? { ...p, user: { ...p.user, onlineStatus: { isOnline: false, lastSeen } } }
              : p
          ),
        }))
      );
    };

    socket.on('new_message', onNewMessage);
    socket.on('messages_read', onMessagesRead);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stopped_typing', onUserStoppedTyping);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);

    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('messages_read', onMessagesRead);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stopped_typing', onUserStoppedTyping);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
    };
  }, [activeConversation, currentUserId]);

  return {
    conversations, activeConversation, messages,
    typingUsers, onlineUsers, loadingConvs, loadingMessages, sending,
    selectConversation, sendMessage, startConversation, handleTyping, loadConversations,
  };
}