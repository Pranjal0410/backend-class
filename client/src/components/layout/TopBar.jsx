/**
 * TopBar Component
 * Top bar with search, notifications, and connection status
 */
import { ConnectionStatus } from '../ConnectionStatus';

export function TopBar({ title, searchQuery, onSearchChange }) {
  return (
    <div className="topbar">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-bold text-primary">{title}</h1>}
      </div>

      {/* Search */}
      {onSearchChange && (
        <div className="topbar__search">
          <svg className="topbar__search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            className="topbar__search-input"
          />
        </div>
      )}

      {/* Actions */}
      <div className="topbar__actions">
        <ConnectionStatus />

        {/* Notifications */}
        <button className="topbar__notification" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="topbar__notification-badge"></span>
        </button>
      </div>
    </div>
  );
}

export default TopBar;
