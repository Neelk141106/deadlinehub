import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const SocketContext = createContext(null);

/**
 * SocketProvider — manages Socket.IO client lifecycle.
 * Connects to the backend on mount and disconnects on unmount.
 * Exposes { socket, connected } via context.
 */
export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [status, setStatus] = useState('connecting'); // 'connected' | 'reconnecting' | 'disconnected' | 'connecting'

  useEffect(() => {
    // Configure socket instance with robust auto-reconnection options
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to server:', socket.id);
      setStatus('connected');
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] Disconnected from server. Reason:', reason);
      if (reason === 'io client disconnect') {
        setStatus('disconnected');
      } else {
        // Server disconnected or network drop; automatic reconnection will kick in
        setStatus('reconnecting');
      }
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
      setStatus('reconnecting');
    });

    // Manager reconnection lifecycle listeners
    if (socket.io) {
      socket.io.on('reconnect_attempt', (attempt) => {
        console.log(`[Socket.IO] Reconnection attempt #${attempt}`);
        setStatus('reconnecting');
      });

      socket.io.on('reconnect', (attempt) => {
        console.log(`[Socket.IO] Reconnected successfully after #${attempt} attempts`);
        setStatus('connected');
      });

      socket.io.on('reconnect_error', (err) => {
        console.warn('[Socket.IO] Reconnection error:', err.message);
        setStatus('reconnecting');
      });

      socket.io.on('reconnect_failed', () => {
        console.error('[Socket.IO] Failed to reconnect after all attempts');
        setStatus('disconnected');
      });
    }

    // Clean up on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const connected = status === 'connected';

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, status }}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * useSocket — consume the Socket.IO context.
 * Returns { socket, connected }.
 */
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === null) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
