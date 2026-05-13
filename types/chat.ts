export type MessageType = 'TEXT' | 'SYSTEM' | 'TASK' | 'FILE' | 'IMAGE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';
export type ConversationType = 'DIRECT' | 'GROUP' | 'BOOKING' | 'LEAD';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string | null;
  role: string;
  department?: string | null;
  onlineStatus?: {
    isOnline: boolean;
    lastSeen: string;
  } | null;
}

export interface MessageReadReceipt {
  id: string;
  messageId: string;
  userId: string;
  readAt: string;
  user: Pick<ChatUser, 'id' | 'name'>;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: Pick<ChatUser, 'id' | 'name' | 'profileImage' | 'role'>;
  messageText?: string | null;
  messageType: MessageType;
  attachmentUrl?: string | null;
  metadata?: Record<string, any> | null;
  status: MessageStatus;
  readReceipts: MessageReadReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: ChatUser;
  lastReadAt?: string | null;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string | null;
  bookingId?: string | null;
  leadId?: string | null;
  customerId?: string | null;
  lastMessageAt?: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages?: Message[];
  unreadCount?: number;
  booking?: { id: string; status: string; customer: { name: string } } | null;
  lead?: { id: string; name: string; phone: string } | null;
  customer?: { id: string; name: string; phone: string } | null;
}

export interface CreateConversationPayload {
  participantId: string;
  type?: ConversationType;
  title?: string;
  bookingId?: string;
  leadId?: string;
  customerId?: string;
}

export interface SendMessagePayload {
  messageText?: string;
  messageType?: MessageType;
  attachmentUrl?: string;
  metadata?: Record<string, any>;
}

export interface GetMessagesParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

// Socket event types
export interface SocketNewMessageEvent {
  conversationId: string;
  message: Message;
}

export interface SocketMessagesReadEvent {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface SocketTypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
}