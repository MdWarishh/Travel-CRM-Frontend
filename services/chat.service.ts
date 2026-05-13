import api from '@/lib/api';
import {
  Conversation, Message, ChatUser,
  CreateConversationPayload, SendMessagePayload, GetMessagesParams,
} from '@/types/chat';
import { ApiResponse } from '@/types';

export const chatService = {
  // Conversations
  getConversations: async (): Promise<Conversation[]> => {
    const res = await api.get<ApiResponse<Conversation[]>>('/chats/conversations');
    return res.data.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const res = await api.get<ApiResponse<Conversation>>(`/chats/conversations/${id}`);
    return res.data.data;
  },

  createOrGetConversation: async (data: CreateConversationPayload): Promise<Conversation> => {
    const res = await api.post<ApiResponse<Conversation>>('/chats/conversations', data);
    return res.data.data;
  },

  // Messages
  getMessages: async (conversationId: string, params?: GetMessagesParams): Promise<Message[]> => {
    const res = await api.get<ApiResponse<Message[]>>(
      `/chats/conversations/${conversationId}/messages`, { params }
    );
    return res.data.data;
  },

  sendMessage: async (conversationId: string, data: SendMessagePayload): Promise<Message> => {
    const res = await api.post<ApiResponse<Message>>(
      `/chats/conversations/${conversationId}/messages`, data
    );
    return res.data.data;
  },

  markAsRead: async (conversationId: string) => {
    const res = await api.put<ApiResponse<{ count: number; messageIds: string[] }>>(
      `/chats/conversations/${conversationId}/read`
    );
    return res.data.data;
  },

  // Users
  searchUsers: async (query: string): Promise<ChatUser[]> => {
    const res = await api.get<ApiResponse<ChatUser[]>>('/chats/users/search', { params: { q: query } });
    return res.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await api.get<ApiResponse<{ count: number }>>('/chats/unread-count');
    return res.data.data.count;
  },

  getBookingConversation: async (bookingId: string): Promise<Conversation | null> => {
    const res = await api.get<ApiResponse<Conversation | null>>(`/chats/booking/${bookingId}`);
    return res.data.data;
  },

  getLeadConversation: async (leadId: string): Promise<Conversation | null> => {
    const res = await api.get<ApiResponse<Conversation | null>>(`/chats/lead/${leadId}`);
    return res.data.data;
  },
};