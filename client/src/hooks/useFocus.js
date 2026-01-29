/**
 * useFocus Hook
 * Track and broadcast user focus on sections/fields
 *
 * USAGE:
 * const { onFocus, onBlur, focusedUsers } = useFocus(incidentId, 'notes');
 *
 * <textarea onFocus={onFocus} onBlur={onBlur} />
 * {focusedUsers.map(u => <span style={{color: u.color}}>{u.name}</span>)}
 */
import { useCallback } from 'react';
import { useFocusStore } from '../stores';
import { updateFocus, clearFocus } from '../services/socket';

export function useFocus(incidentId, section, fieldId = null) {
  const focusedUsers = useFocusStore((state) =>
    fieldId
      ? state.getUserOnField(incidentId, section, fieldId)
      : state.getUsersInSection(incidentId, section)
  );

  const onFocus = useCallback(() => {
    updateFocus(incidentId, section, fieldId);
  }, [incidentId, section, fieldId]);

  const onBlur = useCallback(() => {
    clearFocus(incidentId);
  }, [incidentId]);

  return {
    onFocus,
    onBlur,
    focusedUsers,
    hasFocus: focusedUsers.length > 0
  };
}

export default useFocus;
