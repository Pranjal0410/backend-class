/**
 * AssignResponder Component
 * Admin-only control to assign responders to incidents
 *
 * RBAC: Only visible to admins
 * Server-authoritative: Waits for socket confirmation before updating UI
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores';
import { useSocketStore } from '../stores';
import { userApi } from '../services/api';
import { assignUser } from '../services/socket';
import { canPerformAction } from '../utils/permissions';

export function AssignResponder({ incidentId, currentAssignees = [] }) {
  const [responders, setResponders] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isConnected = useSocketStore((state) => state.isConnected);

  // Check if current user can assign (admin only)
  const canAssign = user && canPerformAction(user.role, 'incident.assign');

  // Fetch available responders on mount
  useEffect(() => {
    const fetchResponders = async () => {
      try {
        const { users } = await userApi.list({ role: 'responder' });
        setResponders(users);
      } catch (error) {
        console.error('Failed to fetch responders:', error);
      }
    };

    if (canAssign) {
      fetchResponders();
    }
  }, [canAssign]);

  // Don't render if user can't assign
  if (!canAssign) {
    return null;
  }

  // Filter out already assigned responders
  const assignedIds = currentAssignees.map(a => a._id);
  const availableResponders = responders.filter(r => !assignedIds.includes(r._id));

  const handleAssign = () => {
    if (!selectedUserId || !isConnected) return;

    setIsLoading(true);
    assignUser(incidentId, selectedUserId);

    // Reset after sending (UI will update from socket event)
    setTimeout(() => {
      setSelectedUserId('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <label className="block text-sm font-medium text-gray-600 mb-2">
        Assign Responder
        <span className="ml-2 text-xs text-gray-400" title="Only administrators can assign responders">
          (Admin only)
        </span>
      </label>

      <div className="flex gap-2">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={!isConnected || isLoading || availableResponders.length === 0}
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">
            {availableResponders.length === 0
              ? 'No responders available'
              : 'Select a responder...'}
          </option>
          {availableResponders.map((responder) => (
            <option key={responder._id} value={responder._id}>
              {responder.name} ({responder.email})
            </option>
          ))}
        </select>

        <button
          onClick={handleAssign}
          disabled={!selectedUserId || !isConnected || isLoading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      {!isConnected && (
        <p className="mt-2 text-xs text-amber-600">
          Waiting for server connection...
        </p>
      )}
    </div>
  );
}

export default AssignResponder;
