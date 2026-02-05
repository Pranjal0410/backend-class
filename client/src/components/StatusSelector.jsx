/**
 * StatusSelector Component
 * Role-aware status update control - Dark theme
 */
import { useState, useEffect } from 'react';
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
  const [confirmation, setConfirmation] = useState(null);
  const { onFocus, onBlur, focusedUsers } = useFocus(incidentId, 'status');

  const currentStatusObj = STATUSES.find((s) => s.value === currentStatus) || STATUSES[0];

  // Show confirmation when status changes
  useEffect(() => {
    if (confirmation) {
      const timer = setTimeout(() => setConfirmation(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmation]);

  const handleStatusChange = (newStatus) => {
    if (newStatus !== currentStatus) {
      updateStatus(incidentId, newStatus);
      const newStatusObj = STATUSES.find(s => s.value === newStatus);
      setConfirmation(`Status updated to ${newStatusObj?.label}`);
    }
    setIsOpen(false);
    onBlur();
  };

  // VIEWER: Read-only badge
  if (!canWrite) {
    return (
      <div className="status-badge-readonly flex items-center gap-2">
        <span
          className="badge"
          style={{
            backgroundColor: `${currentStatusObj.color}20`,
            color: currentStatusObj.color
          }}
        >
          {currentStatusObj.label}
        </span>
        <span className="text-xs text-muted">(read only)</span>
      </div>
    );
  }

  // RESPONDER/ADMIN: Interactive dropdown
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
          'btn btn--secondary flex items-center gap-2',
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-secondary border rounded-lg shadow-lg z-10 min-w-[12rem]">
          {STATUSES.map((status) => (
            <button
              key={status.value}
              onClick={() => handleStatusChange(status.value)}
              disabled={status.value === currentStatus}
              className={clsx(
                'w-full px-4 py-2 text-left flex items-center gap-2',
                'hover:bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed',
                'text-primary transition-colors'
              )}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              {status.label}
              {status.value === currentStatus && (
                <svg className="ml-auto w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Inline confirmation */}
      {confirmation && (
        <div className="absolute top-full left-0 mt-2 flex items-center gap-1 text-sm text-green-500 animate-fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {confirmation}
        </div>
      )}
    </div>
  );
}

export default StatusSelector;
