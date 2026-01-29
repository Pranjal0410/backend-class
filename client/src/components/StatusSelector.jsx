/**
 * StatusSelector Component
 * Role-aware status update control
 *
 * - Viewers see read-only badge
 * - Responders/Admins see dropdown
 * - Shows focus presence indicators
 *
 * GRACEFUL DEGRADATION:
 * Viewers see a styled badge with the current status.
 * This is better than a disabled dropdown (less confusing).
 */
import { useState } from 'react';
import { useAuthStore } from '../stores';
import { useFocus } from '../hooks';
import { updateStatus } from '../services/socket';
import clsx from 'clsx';

const STATUSES = [
  { value: 'investigating', label: 'Investigating', color: '#EF4444' },
  { value: 'identified', label: 'Identified', color: '#F59E0B' },
  { value: 'monitoring', label: 'Monitoring', color: '#3B82F6' },
  { value: 'resolved', label: 'Resolved', color: '#10B981' }
];

export function StatusSelector({ incidentId, currentStatus }) {
  const canWrite = useAuthStore((state) => state.canWrite());
  const [isOpen, setIsOpen] = useState(false);
  const { onFocus, onBlur, focusedUsers } = useFocus(incidentId, 'status');

  const currentStatusObj = STATUSES.find((s) => s.value === currentStatus) || STATUSES[0];

  const handleStatusChange = (newStatus) => {
    if (newStatus !== currentStatus) {
      updateStatus(incidentId, newStatus);
    }
    setIsOpen(false);
    onBlur();
  };

  // ─────────────────────────────────────────
  // VIEWER: Read-only badge
  // ─────────────────────────────────────────
  if (!canWrite) {
    return (
      <div className="status-badge-readonly">
        <span
          className="status-badge"
          style={{ backgroundColor: currentStatusObj.color }}
        >
          {currentStatusObj.label}
        </span>
        <span className="text-xs text-gray-500 ml-2">(read only)</span>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RESPONDER/ADMIN: Interactive dropdown
  // ─────────────────────────────────────────
  return (
    <div className="status-selector relative">
      {/* Focus presence indicators */}
      {focusedUsers.length > 0 && (
        <div className="focus-indicators absolute -top-6 left-0 flex gap-1">
          {focusedUsers.map((user) => (
            <span
              key={user.userId}
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: user.color, color: 'white' }}
            >
              {user.name}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) onFocus();
        }}
        onBlur={onBlur}
        className={clsx(
          'status-button px-4 py-2 rounded flex items-center gap-2',
          'border-2 transition-colors',
          focusedUsers.length > 0 && 'ring-2'
        )}
        style={{
          borderColor: currentStatusObj.color,
          ringColor: focusedUsers[0]?.color
        }}
      >
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: currentStatusObj.color }}
        />
        {currentStatusObj.label}
        <span className="ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="status-dropdown absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={status.value === currentStatus}
              className={clsx(
                'w-full px-4 py-2 text-left flex items-center gap-2',
                'hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
              {status.value === currentStatus && ' ✓'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default StatusSelector;
