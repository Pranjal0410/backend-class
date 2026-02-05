/**
 * RoleBadge Component
 * Displays user's role as a colored badge with tooltip - Dark theme
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

  const tooltips = {
    admin: 'Administrators can manage users and assign responders',
    responder: 'Responders can update incidents, add notes, and action items',
    viewer: 'Viewers can observe incidents but cannot make changes'
  };

  return (
    <div className="role-badge-container relative group">
      <span
        className="role-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-help"
        style={{
          backgroundColor: `${getRoleColor(role)}20`,
          color: getRoleColor(role)
        }}
        title={tooltips[role]}
      >
        {getRoleLabel(role)}
      </span>

      {/* Tooltip on hover */}
      <div
        className="absolute right-0 top-full mt-2 w-48 p-2 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        {tooltips[role]}
      </div>

      {showDescription && (
        <p className="text-xs text-muted mt-1">{descriptions[role]}</p>
      )}
    </div>
  );
}

export default RoleBadge;
