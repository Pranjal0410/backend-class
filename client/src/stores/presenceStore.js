/**
 * Presence Store
 * Manages who is currently viewing which incident
 *
 * STORE OWNERSHIP: This store owns all presence domain state.
 * No other store should modify presence directly.
 *
 * STATE SOURCES:
 * ─────────────────────────────────────────
 * 1. Socket.io events only (no REST):
 *    - presence:list → setPresence() (initial list on join)
 *    - presence:joined → addUser()
 *    - presence:left → removeUser()
 *
 * WHY SEPARATE STORE:
 * - Presence updates frequently (join/leave)
 * - Components can subscribe only to presence changes
 * - Prevents re-renders of incident data when presence changes
 *
 * DATA SHAPE:
 * {
 *   incidentId: {
 *     odId: { name, email, color, lastActiveAt }
 *   }
 * }
 */
import { create } from 'zustand';

const usePresenceStore = create((set, get) => ({
  // ─────────────────────────────────────────
  // STATE
  // Map of incidentId → Map of odId → user presence info
  // ─────────────────────────────────────────
  presence: {},

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  /**
   * Set full presence list for an incident
   * Called when: presence:list (on join)
   */
  setPresence: (incidentId, users) => {
    const presenceMap = {};
    users.forEach((user) => {
      presenceMap[user.userId] = {
        name: user.name,
        email: user.email,
        color: user.color,
        lastActiveAt: user.lastActiveAt
      };
    });

    set((state) => ({
      presence: {
        ...state.presence,
        [incidentId]: presenceMap
      }
    }));
  },

  /**
   * Add user to incident presence
   * Called when: presence:joined
   */
  addUser: (incidentId, user) => {
    set((state) => {
      const incidentPresence = state.presence[incidentId] || {};
      return {
        presence: {
          ...state.presence,
          [incidentId]: {
            ...incidentPresence,
            [user.userId]: {
              name: user.name,
              email: user.email,
              color: user.color,
              lastActiveAt: new Date().toISOString()
            }
          }
        }
      };
    });
  },

  /**
   * Remove user from incident presence
   * Called when: presence:left
   */
  removeUser: (incidentId, userId) => {
    set((state) => {
      const incidentPresence = { ...state.presence[incidentId] };
      delete incidentPresence[userId];
      return {
        presence: {
          ...state.presence,
          [incidentId]: incidentPresence
        }
      };
    });
  },

  /**
   * Clear presence for an incident
   * Called when: leaving incident view
   */
  clearIncidentPresence: (incidentId) => {
    set((state) => {
      const presence = { ...state.presence };
      delete presence[incidentId];
      return { presence };
    });
  },

  // ─────────────────────────────────────────
  // SELECTORS
  // ─────────────────────────────────────────

  /**
   * Get users currently viewing an incident
   */
  getIncidentUsers: (incidentId) => {
    const presence = get().presence[incidentId] || {};
    return Object.entries(presence).map(([userId, data]) => ({
      userId,
      ...data
    }));
  },

  /**
   * Get count of users viewing an incident
   */
  getUserCount: (incidentId) => {
    const presence = get().presence[incidentId] || {};
    return Object.keys(presence).length;
  }
}));

export default usePresenceStore;
