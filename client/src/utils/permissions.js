/**
 * Permissions Utilities
 *
 * IMPORTANT: These are for UX only. Server enforces actual permissions.
 *
 * Role Hierarchy:
 * - admin: Full access (create, modify, delete, manage users)
 * - responder: Can modify incidents (create, update, assign, notes)
 * - viewer: Read-only access
 *
 * WHY FRONTEND CHECKS:
 * - Prevent confusing UI states (button that does nothing)
 * - Improve UX by hiding irrelevant options
 * - NOT for security (server rejects unauthorized actions anyway)
 */

// Roles that can modify incidents
const WRITE_ROLES = ['admin', 'responder'];

/**
 * Check if role can write to incidents
 */
export const canWrite = (role) => WRITE_ROLES.includes(role);

/**
 * Check if role is admin
 */
export const isAdmin = (role) => role === 'admin';

/**
 * Check if role can perform specific action
 */
export const canPerformAction = (role, action) => {
  const permissions = {
    'incident.create': ['admin', 'responder'],
    'incident.update': ['admin', 'responder'],
    'incident.delete': ['admin'],
    'incident.assign': ['admin', 'responder'],
    'incident.note': ['admin', 'responder'],
    'incident.action_item': ['admin', 'responder'],
    'user.manage': ['admin']
  };

  const allowedRoles = permissions[action] || [];
  return allowedRoles.includes(role);
};

/**
 * Get human-readable role label
 */
export const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrator',
    responder: 'Responder',
    viewer: 'Viewer'
  };
  return labels[role] || 'Unknown';
};

/**
 * Get role badge color
 */
export const getRoleColor = (role) => {
  const colors = {
    admin: '#EF4444',     // red
    responder: '#3B82F6', // blue
    viewer: '#6B7280'     // gray
  };
  return colors[role] || '#6B7280';
};
