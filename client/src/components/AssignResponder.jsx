/**
 * AssignResponder Component
 * Admin-only control to assign responders to incidents - Dark theme
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

  // Fetch available users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { users } = await userApi.list({});
        const assignableUsers = users.filter(u => u.role === 'responder' || u.role === 'admin');
        setResponders(assignableUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    if (canAssign) {
      fetchUsers();
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

    setTimeout(() => {
      setSelectedUserId('');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
      <label className="label flex items-center gap-2">
        Assign Responder
        <span className="text-xs text-muted" title="Only administrators can assign responders">
          (Admin only)
        </span>
      </label>

      <div className="flex gap-2">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={!isConnected || isLoading || availableResponders.length === 0}
          className="select flex-1"
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
          className="btn btn--primary"
        >
          {isLoading ? 'Assigning...' : 'Assign'}
        </button>
      </div>

      {!isConnected && (
        <p className="mt-2 text-xs text-yellow-500">
          Waiting for server connection...
        </p>
      )}
    </div>
  );
}

export default AssignResponder;
