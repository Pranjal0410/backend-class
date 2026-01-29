/**
 * RoleBadge Component
 * Displays user's role as a colored badge
 *
 * Shows the current user their permissions level.
 * Helpful for viewers to understand why they can't edit.
 */
import { useAuthStore } from '../stores';
import { getRoleLabel, getRoleColor } from '../utils/permissions';

export function RoleBadge({ showDescription = false }) {
  const role = useAuthStore((state) => state.user?.role);

  if (!role) return null;

  const descriptions = {
    admin: 'Full access to all features',
    responder: 'Can create and modify incidents',
    viewer: 'Read-only access'
  };

  return (
    <div className="role-badge-container">
      <span
        className="role-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: getRoleColor(role) }}
      >
        {getRoleLabel(role)}
      </span>
      {showDescription && (
        <p className="text-xs text-gray-500 mt-1">{descriptions[role]}</p>
      )}
    </div>
  );
}

export default RoleBadge;
