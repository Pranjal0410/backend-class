/**
 * RoleGate Component
 * Conditionally render children based on user role
 *
 * USAGE:
 * <RoleGate allowedRoles={['admin', 'responder']}>
 *   <EditButton />
 * </RoleGate>
 *
 * <RoleGate allowedRoles={['admin']} fallback={<ReadOnlyBadge />}>
 *   <DeleteButton />
 * </RoleGate>
 *
 * IMPORTANT:
 * This is for UX only. The server enforces actual permissions.
 * If a user bypasses this (e.g., DevTools), the server will reject the action.
 */
import { useAuthStore } from '../stores';

export function RoleGate({
  children,
  allowedRoles,
  fallback = null,
  showMessage = false
}) {
  const role = useAuthStore((state) => state.user?.role);

  // Not authenticated
  if (!role) {
    return fallback;
  }

  // Check if user's role is in allowed list
  if (allowedRoles.includes(role)) {
    return children;
  }

  // User doesn't have permission
  if (showMessage) {
    return (
      <div className="role-gate-message">
        <span className="text-gray-500 text-sm italic">
          {role === 'viewer'
            ? 'View only - you cannot modify incidents'
            : 'You do not have permission for this action'}
        </span>
      </div>
    );
  }

  return fallback;
}

/**
 * Convenience component for write-only content
 */
export function WriteGate({ children, fallback = null }) {
  return (
    <RoleGate allowedRoles={['admin', 'responder']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Convenience component for admin-only content
 */
export function AdminGate({ children, fallback = null }) {
  return (
    <RoleGate allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

export default RoleGate;
