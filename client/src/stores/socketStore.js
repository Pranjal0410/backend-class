/**
 * Socket Store
 * Manages Socket.io connection state
 *
 * WHY A SEPARATE STORE:
 * - Connection status is its own concern
 * - Components can show connection indicators
 * - Reconnection state needs to be tracked
 *
 * The actual socket instance is managed by useSocket hook,
 * this store just tracks connection state for UI.
 */
import { create } from 'zustand';

const useSocketStore = create((set) => ({
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  isConnected: false,
  isConnecting: false,
  connectionError: null,
  lastConnectedAt: null,

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  setConnected: () => set({
    isConnected: true,
    isConnecting: false,
    connectionError: null,
    lastConnectedAt: new Date().toISOString()
  }),

  setDisconnected: () => set({
    isConnected: false,
    isConnecting: false
  }),

  setConnecting: () => set({
    isConnecting: true,
    connectionError: null
  }),

  setConnectionError: (error) => set({
    isConnected: false,
    isConnecting: false,
    connectionError: error
  })
}));

export default useSocketStore;
