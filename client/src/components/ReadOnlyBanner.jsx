/**
 * ReadOnlyBanner Component
 * Shows a subtle banner for viewers indicating read-only mode - Dark theme
 */
import { useAuthStore } from '../stores';

export function ReadOnlyBanner() {
  const user = useAuthStore((state) => state.user);

  // Only show for viewers
  if (user?.role !== 'viewer') {
    return null;
  }

  return (
    <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: 'rgba(212, 168, 83, 0.1)', border: '1px solid var(--accent-muted)' }}>
      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-accent">Read-only mode. You can observe but not modify this incident.</span>
    </div>
  );
}

export default ReadOnlyBanner;
