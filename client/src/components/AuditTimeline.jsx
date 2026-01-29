/**
 * AuditTimeline Component
 * Renders immutable, chronological audit trail
 *
 * WHY AUDITABILITY MATTERS (Interview answer):
 * "In incident response, the timeline is critical for post-incident reviews.
 * You need to know what happened, when, and by whom. That's why updates are
 * structured and immutable - not free-form chat messages."
 *
 * This is NOT a chat system because:
 * - Updates are typed (status_change, note, assignment, action_item)
 * - Each update has structured content
 * - Updates are immutable (no editing/deleting)
 * - Used for compliance and learning, not conversation
 */

const UPDATE_ICONS = {
  status_change: '🔄',
  note: '📝',
  assignment: '👤',
  action_item: '✓'
};

const UPDATE_COLORS = {
  status_change: '#8B5CF6', // purple
  note: '#3B82F6',          // blue
  assignment: '#10B981',    // green
  action_item: '#F59E0B'    // amber
};

export function AuditTimeline({ updates, grouped = false }) {
  if (!updates || updates.length === 0) {
    return (
      <div className="text-gray-500 text-sm bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center">
        <p className="font-medium text-gray-600 mb-1">No timeline events yet</p>
        <p className="text-gray-400">All status changes, notes, and assignments will appear here.</p>
      </div>
    );
  }

  // Sort by createdAt ascending (oldest first)
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Group by type if requested
  if (grouped) {
    const groupedByType = sortedUpdates.reduce((acc, update) => {
      const type = update.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(update);
      return acc;
    }, {});

    const typeLabels = {
      status_change: 'Status Changes',
      note: 'Notes',
      assignment: 'Assignments',
      action_item: 'Action Items'
    };

    const typeOrder = ['status_change', 'note', 'assignment', 'action_item'];

    return (
      <div className="audit-timeline">
        {typeOrder.map(type => {
          const typeUpdates = groupedByType[type];
          if (!typeUpdates || typeUpdates.length === 0) return null;

          return (
            <div key={type} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: UPDATE_COLORS[type] }}
                />
                {typeLabels[type]} ({typeUpdates.length})
              </h4>
              <div className="space-y-4">
                {typeUpdates.map((update, index) => (
                  <TimelineEntry key={update._id || index} update={update} compact />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="audit-timeline">
      <div className="space-y-4">
        {sortedUpdates.map((update, index) => (
          <TimelineEntry key={update._id || index} update={update} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual timeline entry
 */
function TimelineEntry({ update, compact = false }) {
  const icon = UPDATE_ICONS[update.type] || '•';
  const color = UPDATE_COLORS[update.type] || '#6B7280';
  const time = new Date(update.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const date = new Date(update.createdAt).toLocaleDateString();
  const userName = update.userId?.name || 'Unknown';

  const message = formatUpdateMessage(update);

  // Compact mode for grouped view
  if (compact) {
    return (
      <div className="flex items-start gap-3 text-sm">
        <div className="text-gray-400 w-16 flex-shrink-0">{time}</div>
        <div className="flex-1">
          <span className="font-medium text-gray-700">{userName}</span>
          <span className="text-gray-500 mx-1">—</span>
          <span className="text-gray-600">{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {/* Timestamp */}
      <div className="flex-shrink-0 w-20 text-right">
        <div className="text-sm font-medium text-gray-700">{time}</div>
        <div className="text-xs text-gray-400">{date}</div>
      </div>

      {/* Icon & Line */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="font-medium text-gray-900">{userName}</div>
        <div className="text-gray-600 mt-1">{message}</div>
      </div>
    </div>
  );
}

/**
 * Format update into human-readable message
 */
function formatUpdateMessage(update) {
  switch (update.type) {
    case 'status_change':
      return (
        <span>
          Changed status{' '}
          {update.content.previousStatus && (
            <>
              from <StatusBadge status={update.content.previousStatus} />{' '}
            </>
          )}
          to <StatusBadge status={update.content.newStatus} />
        </span>
      );

    case 'note':
      return (
        <span>
          Added note: <em>"{update.content.text}"</em>
        </span>
      );

    case 'assignment':
      const action = update.content.action === 'assigned' ? 'Assigned' : 'Unassigned';
      const target = update.content.targetUser?.name || 'a user';
      return (
        <span>
          {action} <strong>{target}</strong> to this incident
        </span>
      );

    case 'action_item':
      if (update.content.completed !== undefined) {
        const status = update.content.completed ? 'completed' : 'added';
        return (
          <span>
            {status === 'completed' ? 'Completed' : 'Added'} action item:{' '}
            <em>"{update.content.text}"</em>
          </span>
        );
      }
      return (
        <span>
          Added action item: <em>"{update.content.text}"</em>
        </span>
      );

    default:
      return <span>Unknown update type</span>;
  }
}

/**
 * Status badge for timeline
 */
function StatusBadge({ status }) {
  const colors = {
    investigating: '#EF4444',
    identified: '#F59E0B',
    monitoring: '#3B82F6',
    resolved: '#10B981'
  };

  return (
    <span
      className="inline-flex px-2 py-0.5 text-xs font-medium rounded text-white"
      style={{ backgroundColor: colors[status] || '#6B7280' }}
    >
      {status}
    </span>
  );
}

export default AuditTimeline;
