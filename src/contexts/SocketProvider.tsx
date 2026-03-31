import React, { createContext, useContext, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, getToken } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      socket.disconnect();
      return;
    }

    const token = getToken();
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    socket.on('connect', () => {
      console.log('🟢 SOCKET CONNECTED (GLOBAL):', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔴 SOCKET DISCONNECTED:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ SOCKET ERROR:', err.message);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [isAuthenticated, isAdmin]);

  return (
    <SocketContext.Provider value={null}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
