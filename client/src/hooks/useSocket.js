/**
 * useSocket Hook
 * Manages socket lifecycle tied to auth state
 *
 * USAGE:
 * Call once at app root when user is authenticated.
 * Automatically connects/disconnects based on auth state.
 */
import { useEffect, useRef } from 'react';
import { useAuthStore, useSocketStore } from '../stores';
import { initSocket, disconnectSocket, sendHeartbeat } from '../services/socket';

const HEARTBEAT_INTERVAL = 60000; // 1 minute

export function useSocket() {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isConnected = useSocketStore((state) => state.isConnected);
  const heartbeatRef = useRef(null);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, token]);

  // Heartbeat to keep presence alive
  useEffect(() => {
    if (isConnected) {
      heartbeatRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isConnected]);

  return { isConnected };
}

export default useSocket;
