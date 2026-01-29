/**
 * Incident Store
 * Manages incident list and active incident state
 *
 * STORE OWNERSHIP: This store owns all incident domain state.
 * No other store should modify incidents or updates directly.
 *
 * STATE SOURCES:
 * ─────────────────────────────────────────
 * 1. REST API (initial fetch):
 *    - GET /api/incidents → populateIncidents()
 *    - GET /api/incidents/:id → setActiveIncident()
 *
 * 2. Socket.io (incremental updates):
 *    - incident:updated → updateIncident()
 *    - incident:noteAdded → addUpdate()
 *    - incident:assigned → updateIncident()
 *    - incident:actionItemAdded → addUpdate()
 *    - incident:actionItemToggled → toggleActionItem()
 *
 * WHY ZUSTAND:
 * - Simple API, minimal boilerplate
 * - No provider wrapper needed
 * - Easy to update from both REST and Socket callbacks
 * - Selective subscriptions prevent unnecessary re-renders
 *
 * AVOIDING DESYNC:
 * - State only updates from server responses
 * - No optimistic updates for shared state
 * - Local UI state (form inputs) is separate from server state
 */
import { create } from 'zustand';

const useIncidentStore = create((set, get) => ({
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  // List of all incidents (dashboard view)
  incidents: [],
  incidentsLoading: false,
  incidentsError: null,

  // Currently viewed incident with full details
  activeIncident: null,
  activeIncidentUpdates: [], // Timeline updates
  activeIncidentLoading: false,
  activeIncidentError: null,

  // ─────────────────────────────────────────
  // ACTIONS: REST API RESPONSES
  // These populate initial state from server
  // ─────────────────────────────────────────

  /**
   * Populate incidents list from REST API
   * Called on dashboard mount
   */
  setIncidents: (incidents) => {
    set({ incidents, incidentsLoading: false, incidentsError: null });
  },

  /**
   * Set active incident from REST API (with updates)
   * Called when entering incident detail view
   */
  setActiveIncident: (incident, updates = []) => {
    set({
      activeIncident: incident,
      activeIncidentUpdates: updates,
      activeIncidentLoading: false,
      activeIncidentError: null
    });
  },

  /**
   * Clear active incident (when leaving detail view)
   */
  clearActiveIncident: () => {
    set({
      activeIncident: null,
      activeIncidentUpdates: []
    });
  },

  // ─────────────────────────────────────────
  // ACTIONS: SOCKET.IO EVENTS
  // These update state incrementally from server
  // ─────────────────────────────────────────

  /**
   * Update an incident from socket event
   * Called when: incident:updated, incident:assigned
   */
  updateIncident: (incidentId, updatedIncident) => {
    set((state) => {
      // Update in list
      const incidents = state.incidents.map((inc) =>
        inc._id === incidentId ? { ...inc, ...updatedIncident } : inc
      );

      // Update active incident if it's the one being viewed
      const activeIncident =
        state.activeIncident?._id === incidentId
          ? { ...state.activeIncident, ...updatedIncident }
          : state.activeIncident;

      return { incidents, activeIncident };
    });
  },

  /**
   * Add a new incident to the list
   * Called when: new incident created (from socket or after REST create)
   */
  addIncident: (incident) => {
    set((state) => ({
      incidents: [incident, ...state.incidents]
    }));
  },

  /**
   * Add an update to the active incident's timeline
   * Called when: incident:noteAdded, incident:actionItemAdded
   */
  addUpdate: (update) => {
    set((state) => {
      if (state.activeIncident?._id !== update.incidentId) {
        return state; // Not viewing this incident
      }

      return {
        activeIncidentUpdates: [...state.activeIncidentUpdates, update]
      };
    });
  },

  /**
   * Toggle action item completion status
   * Called when: incident:actionItemToggled
   */
  toggleActionItem: (updateId, completed) => {
    set((state) => ({
      activeIncidentUpdates: state.activeIncidentUpdates.map((update) =>
        update._id === updateId
          ? { ...update, content: { ...update.content, completed } }
          : update
      )
    }));
  },

  // ─────────────────────────────────────────
  // ACTIONS: LOADING STATES
  // ─────────────────────────────────────────

  setIncidentsLoading: (loading) => set({ incidentsLoading: loading }),
  setIncidentsError: (error) => set({ incidentsError: error, incidentsLoading: false }),

  setActiveIncidentLoading: (loading) => set({ activeIncidentLoading: loading }),
  setActiveIncidentError: (error) => set({ activeIncidentError: error, activeIncidentLoading: false }),

  // ─────────────────────────────────────────
  // SELECTORS (for components)
  // ─────────────────────────────────────────

  /**
   * Get incidents filtered by status
   */
  getIncidentsByStatus: (status) => {
    return get().incidents.filter((inc) => inc.status === status);
  },

  /**
   * Get active incidents (not resolved)
   */
  getActiveIncidents: () => {
    return get().incidents.filter((inc) => inc.status !== 'resolved');
  },

  /**
   * Get action items from active incident updates
   */
  getActionItems: () => {
    return get().activeIncidentUpdates.filter((u) => u.type === 'action_item');
  },

  /**
   * Get notes from active incident updates
   */
  getNotes: () => {
    return get().activeIncidentUpdates.filter((u) => u.type === 'note');
  }
}));

export default useIncidentStore;
