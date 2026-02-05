/**
 * ActionItemList Component
 * Role-aware action items display and management - Dark theme
 */
import { useState } from 'react';
import { useAuthStore, useIncidentStore } from '../stores';
import { useFocus } from '../hooks';
import { addActionItem, toggleActionItem } from '../services/socket';
import clsx from 'clsx';

export function ActionItemList({ incidentId }) {
  const canWrite = useAuthStore((state) => state.canWrite());
  const actionItems = useIncidentStore((state) => state.getActionItems());
  const [newItemText, setNewItemText] = useState('');
  const { onFocus, onBlur, focusedUsers } = useFocus(incidentId, 'action_items');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    addActionItem(incidentId, newItemText.trim());
    setNewItemText('');
    onBlur();
  };

  const handleToggle = (updateId, currentCompleted) => {
    if (!canWrite) return;
    toggleActionItem(incidentId, updateId, !currentCompleted);
  };

  return (
    <div className="action-item-list">
      <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
        Action Items
        {!canWrite && (
          <span className="text-xs text-muted font-normal">(read only)</span>
        )}
      </h3>

      {/* Focus indicators */}
      {focusedUsers.length > 0 && (
        <div className="focus-indicators mb-2 flex gap-1 flex-wrap">
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

      {/* Action items list */}
      <ul className="space-y-2 mb-4">
        {actionItems.length === 0 ? (
          <li className="empty-state">
            <p className="empty-state__title">No action items defined</p>
            <p className="empty-state__description">Create tasks to track remediation steps and follow-ups.</p>
          </li>
        ) : (
          actionItems.map((item) => (
            <li
              key={item._id}
              className={clsx(
                'flex items-start gap-3 p-2 rounded-lg transition-colors',
                item.content.completed && 'bg-tertiary'
              )}
              style={{ backgroundColor: item.content.completed ? 'var(--bg-tertiary)' : 'transparent' }}
            >
              <input
                type="checkbox"
                checked={item.content.completed}
                onChange={() => handleToggle(item._id, item.content.completed)}
                disabled={!canWrite}
                className={clsx(
                  'mt-1 h-4 w-4 rounded accent-accent',
                  canWrite ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                )}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="flex-1">
                <p
                  className={clsx(
                    'text-primary',
                    item.content.completed && 'line-through text-muted'
                  )}
                >
                  {item.content.text}
                </p>
                <p className="text-xs text-muted mt-1">
                  Added by {item.userId?.name || 'Unknown'}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Add new item - only for writers */}
      {canWrite && (
        <form onSubmit={handleAddItem} className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="Add a remediation task or follow-up..."
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!newItemText.trim()}
            className="btn btn--primary"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}

export default ActionItemList;
