'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket, getSocket } from '@/lib/socket';

const SocketContext = createContext<Socket | null>(null);

export function useSocketContext() {
  return useContext(SocketContext);
}

interface Props {
  token: string;
  children: React.ReactNode;
}

export function SocketProvider({ token, children }: Props) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = initSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}