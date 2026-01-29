/**
 * Focus Store
 * Manages ephemeral focus/cursor presence
 *
 * STORE OWNERSHIP: This store owns all focus domain state.
 * No other store should modify focus directly.
 *
 * STATE SOURCES:
 * ─────────────────────────────────────────
 * 1. Socket.io events only:
 *    - focus:list → setFocusStates() (initial on join)
 *    - focus:updated → updateUserFocus()
 *    - focus:cleared → clearUserFocus()
 *
 * 2. Local user focus (for emitting):
 *    - setMyFocus() → emit focus:update
 *    - clearMyFocus() → emit focus:clear
 *
 * WHY SEPARATE FROM PRESENCE:
 * - Focus changes rapidly (every focus/blur event)
 * - Different data shape (includes section, fieldId)
 * - Completely ephemeral (lost on disconnect)
 *
 * DATA SHAPE:
 * {
 *   incidentId: {
 *     odId: { section, fieldId, color, name }
 *   }
 * }
 */
import { create } from 'zustand';

const useFocusStore = create((set, get) => ({
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  // Map of incidentId → Map of odId → focus state
  focus: {},

  // Current user's focus (for local tracking)
  myFocus: null,

  // ─────────────────────────────────────────
  // ACTIONS: FROM SERVER (Socket.io)
  // ─────────────────────────────────────────

  /**
   * Set full focus list for an incident
   * Called when: focus:list (on join)
   */
  setFocusStates: (incidentId, focusStates) => {
    const focusMap = {};
    focusStates.forEach((state) => {
      focusMap[state.userId] = {
        section: state.section,
        fieldId: state.fieldId,
        color: state.color,
        name: state.name
      };
    });

    set((state) => ({
      focus: {
        ...state.focus,
        [incidentId]: focusMap
      }
    }));
  },

  /**
   * Update a user's focus
   * Called when: focus:updated
   */
  updateUserFocus: (incidentId, userId, focusData) => {
    set((state) => {
      const incidentFocus = state.focus[incidentId] || {};
      return {
        focus: {
          ...state.focus,
          [incidentId]: {
            ...incidentFocus,
            [userId]: {
              section: focusData.section,
              fieldId: focusData.fieldId,
              color: focusData.color,
              name: focusData.name
            }
          }
        }
      };
    });
  },

  /**
   * Clear a user's focus
   * Called when: focus:cleared
   */
  clearUserFocus: (incidentId, userId) => {
    set((state) => {
      const incidentFocus = { ...state.focus[incidentId] };
      delete incidentFocus[userId];
      return {
        focus: {
          ...state.focus,
          [incidentId]: incidentFocus
        }
      };
    });
  },

  // ─────────────────────────────────────────
  // ACTIONS: LOCAL USER
  // ─────────────────────────────────────────

  /**
   * Set current user's focus (local state)
   * Component calls this, then emits socket event
   */
  setMyFocus: (incidentId, section, fieldId = null) => {
    set({ myFocus: { incidentId, section, fieldId } });
  },

  /**
   * Clear current user's focus
   */
  clearMyFocus: () => {
    set({ myFocus: null });
  },

  /**
   * Clear all focus state for an incident
   * Called when: leaving incident view
   */
  clearIncidentFocus: (incidentId) => {
    set((state) => {
      const focus = { ...state.focus };
      delete focus[incidentId];
      return { focus, myFocus: null };
    });
  },

  // ─────────────────────────────────────────
  // SELECTORS
  // ─────────────────────────────────────────

  /**
   * Get all users focused on a section
   */
  getUsersInSection: (incidentId, section) => {
    const focus = get().focus[incidentId] || {};
    return Object.entries(focus)
      .filter(([_, data]) => data.section === section)
      .map(([userId, data]) => ({ userId, ...data }));
  },

  /**
   * Get user focused on a specific field
   */
  getUserOnField: (incidentId, section, fieldId) => {
    const focus = get().focus[incidentId] || {};
    return Object.entries(focus)
      .filter(([_, data]) => data.section === section && data.fieldId === fieldId)
      .map(([userId, data]) => ({ userId, ...data }));
  },

  /**
   * Check if a section has any users focused
   */
  isSectionFocused: (incidentId, section) => {
    const focus = get().focus[incidentId] || {};
    return Object.values(focus).some((data) => data.section === section);
  }
}));

export default useFocusStore;
