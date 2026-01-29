/**
 * PresenceIndicator Component
 * Shows who is currently viewing the incident
 *
 * Displays:
 * - Avatar circles with user initials
 * - User's assigned color
 * - Tooltip with full name on hover
 */
import { usePresenceStore, useAuthStore } from '../stores';

export function PresenceIndicator({ incidentId }) {
  const users = usePresenceStore((state) => state.getIncidentUsers(incidentId));
  const currentUserId = useAuthStore((state) => state.user?._id);

  // Filter out current user (they know they're here)
  const otherUsers = users.filter((u) => u.userId !== currentUserId);

  if (otherUsers.length === 0) {
    return (
      <div className="presence-indicator text-sm text-gray-500">
        Only you are viewing this incident
      </div>
    );
  }

  return (
    <div className="presence-indicator flex items-center gap-2">
      <span className="text-sm text-gray-600">Also viewing:</span>
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white cursor-default"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
        ))}
        {otherUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-medium border-2 border-white">
            +{otherUsers.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get initials from name
 */
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default PresenceIndicator;
