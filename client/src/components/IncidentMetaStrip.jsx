/**
 * IncidentMetaStrip Component
 * Shows operational metadata: time elapsed, last update, update count
 *
 * This is a senior internal-tool pattern that shows operational awareness.
 * Engineers think in time - this immediately communicates incident age.
 */
import { useState, useEffect } from 'react';

/**
 * Format duration in human-readable form
 * e.g., "2h 18m ago" or "13 min ago"
 */
const formatTimeAgo = (date) => {
  if (!date) return 'Unknown';

  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const hours = diffHours % 24;
    return hours > 0 ? `${diffDays}d ${hours}h ago` : `${diffDays}d ago`;
  }

  if (diffHours > 0) {
    const mins = diffMins % 60;
    return mins > 0 ? `${diffHours}h ${mins}m ago` : `${diffHours}h ago`;
  }

  if (diffMins > 0) {
    return `${diffMins} min ago`;
  }

  return 'Just now';
};

export function IncidentMetaStrip({ incident, updates = [] }) {
  const [, setTick] = useState(0);

  // Update every minute to keep times fresh
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!incident) return null;

  // Calculate last update time
  const lastUpdate = updates.length > 0
    ? updates.reduce((latest, u) => {
        const uDate = new Date(u.createdAt);
        return uDate > latest ? uDate : latest;
      }, new Date(0))
    : new Date(incident.createdAt);

  const updateCount = updates.length;

  return (
    <div className="flex items-center gap-4 text-sm text-gray-500 py-2 px-4 bg-gray-50 border-b">
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Started:</span>
        <span className="font-medium text-gray-700">{formatTimeAgo(incident.createdAt)}</span>
      </span>

      <span className="text-gray-300">|</span>

      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>Last update:</span>
        <span className="font-medium text-gray-700">{formatTimeAgo(lastUpdate)}</span>
      </span>

      <span className="text-gray-300">|</span>

      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>Updates:</span>
        <span className="font-medium text-gray-700">{updateCount}</span>
      </span>
    </div>
  );
}

export default IncidentMetaStrip;
