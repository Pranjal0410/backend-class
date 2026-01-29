/**
 * NoteInput Component
 * Role-aware note input control
 *
 * GRACEFUL DEGRADATION:
 * - Viewers see no input at all (just the timeline)
 * - Responders/Admins see full input with submit button
 */
import { useState } from 'react';
import { useAuthStore } from '../stores';
import { useFocus } from '../hooks';
import { addNote } from '../services/socket';
import clsx from 'clsx';

export function NoteInput({ incidentId }) {
  const canWrite = useAuthStore((state) => state.canWrite());
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { onFocus, onBlur, focusedUsers } = useFocus(incidentId, 'notes');

  // Viewers don't see the input at all
  if (!canWrite) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    addNote(incidentId, text.trim());

    // Clear after brief delay (server will broadcast confirmation)
    setTimeout(() => {
      setText('');
      setIsSubmitting(false);
      onBlur();
    }, 100);
  };

  return (
    <form onSubmit={handleSubmit} className="note-input relative">
      {/* Focus presence indicators */}
      {focusedUsers.length > 0 && (
        <div className="focus-indicators mb-2 flex gap-1 flex-wrap">
          {focusedUsers.map((user) => (
            <span
              key={user.userId}
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: user.color, color: 'white' }}
            >
              {user.name} is typing...
            </span>
          ))}
        </div>
      )}

      <div
        className={clsx(
          'border-2 rounded transition-colors',
          focusedUsers.length > 0 && 'ring-2'
        )}
        style={{ ringColor: focusedUsers[0]?.color }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Add observations, logs, or findings..."
          className="w-full p-3 rounded resize-none focus:outline-none"
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t">
          <span className="text-xs text-gray-500">
            {text.length}/2000 characters
          </span>
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className={clsx(
              'px-4 py-1.5 rounded text-white text-sm font-medium',
              'bg-blue-600 hover:bg-blue-700',
              'disabled:bg-gray-300 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default NoteInput;
