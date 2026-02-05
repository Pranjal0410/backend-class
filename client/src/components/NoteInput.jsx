/**
 * NoteInput Component
 * Role-aware note input control - Dark theme
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
          'border rounded-lg overflow-hidden transition-colors',
          focusedUsers.length > 0 && 'ring-2'
        )}
        style={{
          borderColor: 'var(--border-primary)',
          ringColor: focusedUsers[0]?.color
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Add observations, logs, or findings..."
          className="w-full p-3 bg-tertiary text-primary resize-none focus:outline-none"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
          rows={3}
          maxLength={2000}
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center px-3 py-2 border-t" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)' }}>
          <span className="text-xs text-muted">
            {text.length}/2000 characters
          </span>
          <button
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="btn btn--primary btn--sm"
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default NoteInput;
