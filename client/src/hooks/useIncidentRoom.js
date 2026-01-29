/**
 * useIncidentRoom Hook
 * Manages joining/leaving incident rooms for real-time updates
 *
 * USAGE:
 * const { isLoading, error } = useIncidentRoom(incidentId);
 *
 * Automatically:
 * - Joins room on mount
 * - Leaves room on unmount
 * - Fetches incident data
 * - Cleans up presence/focus state
 */
import { useEffect } from 'react';
import { useIncidentStore, usePresenceStore, useFocusStore } from '../stores';
import { incidentApi } from '../services/api';
import { joinIncident, leaveIncident, clearFocus } from '../services/socket';

export function useIncidentRoom(incidentId) {
  const setActiveIncident = useIncidentStore((state) => state.setActiveIncident);
  const clearActiveIncident = useIncidentStore((state) => state.clearActiveIncident);
  const setLoading = useIncidentStore((state) => state.setActiveIncidentLoading);
  const setError = useIncidentStore((state) => state.setActiveIncidentError);
  const isLoading = useIncidentStore((state) => state.activeIncidentLoading);
  const error = useIncidentStore((state) => state.activeIncidentError);

  const clearIncidentPresence = usePresenceStore((state) => state.clearIncidentPresence);
  const clearIncidentFocus = useFocusStore((state) => state.clearIncidentFocus);

  useEffect(() => {
    if (!incidentId) return;

    let mounted = true;

    const fetchAndJoin = async () => {
      setLoading(true);

      try {
        // Fetch incident data via REST
        const { incident, updates, presence } = await incidentApi.get(incidentId);

        if (!mounted) return;

        // Populate store
        setActiveIncident(incident, updates);

        // Join socket room for real-time updates
        joinIncident(incidentId);
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      }
    };

    fetchAndJoin();

    // Cleanup on unmount
    return () => {
      mounted = false;
      leaveIncident(incidentId);
      clearFocus(incidentId);
      clearActiveIncident();
      clearIncidentPresence(incidentId);
      clearIncidentFocus(incidentId);
    };
  }, [incidentId]);

  return { isLoading, error };
}

export default useIncidentRoom;
