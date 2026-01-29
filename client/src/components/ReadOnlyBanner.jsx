/**
 * ReadOnlyBanner Component
 * Shows a subtle banner for viewers indicating read-only mode
 *
 * Professional UX pattern - calm, informative, not alarming
 */
import { useAuthStore } from '../stores';

export function ReadOnlyBanner() {
  const user = useAuthStore((state) => state.user);

  // Only show for viewers
  if (user?.role !== 'viewer') {
    return null;
  }

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Read-only mode. You can observe but not modify this incident.</span>
      </div>
    </div>
  );
}

export default ReadOnlyBanner;
