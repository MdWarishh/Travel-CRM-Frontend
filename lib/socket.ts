import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function initSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => console.log('🔌 Socket connected'));
  socket.on('disconnect', (r) => console.log('❌ Disconnected:', r));
  socket.on('connect_error', (e) => console.error('Socket error:', e.message));

  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export const socketEmit = {
  joinConversation: (id: string) => socket?.emit('join_conversation', { conversationId: id }),
  leaveConversation: (id: string) => socket?.emit('leave_conversation', { conversationId: id }),
  typingStart: (id: string) => socket?.emit('typing_start', { conversationId: id }),
  typingStop: (id: string) => socket?.emit('typing_stop', { conversationId: id }),
  markRead: (id: string) => socket?.emit('mark_read', { conversationId: id }),
};