/**
 * StatusProgression Component
 * Visual representation of incident status state machine - Dark theme
 */

const STATUSES = [
  { value: 'investigating', label: 'Investigating', color: '#EF4444' },
  { value: 'identified', label: 'Identified', color: '#F59E0B' },
  { value: 'monitoring', label: 'Monitoring', color: '#3B82F6' },
  { value: 'resolved', label: 'Resolved', color: '#10B981' }
];

export function StatusProgression({ currentStatus }) {
  const currentIndex = STATUSES.findIndex(s => s.value === currentStatus);

  return (
    <div className="status-progression flex items-center gap-1 text-xs">
      {STATUSES.map((status, index) => {
        const isCurrent = status.value === currentStatus;
        const isPast = index < currentIndex;

        return (
          <div key={status.value} className="flex items-center">
            {/* Status step */}
            <div
              className={`
                px-2 py-1 rounded-full font-medium transition-all
                ${isCurrent
                  ? 'text-white shadow-sm'
                  : isPast
                    ? 'text-white opacity-60'
                    : 'text-muted'
                }
              `}
              style={{
                backgroundColor: isCurrent || isPast ? status.color : 'var(--bg-tertiary)'
              }}
            >
              {status.label}
            </div>

            {/* Arrow connector */}
            {index < STATUSES.length - 1 && (
              <svg
                className={`w-4 h-4 mx-1 ${index < currentIndex ? 'text-muted' : 'text-muted'}`}
                style={{ opacity: index < currentIndex ? 0.6 : 0.3 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatusProgression;
