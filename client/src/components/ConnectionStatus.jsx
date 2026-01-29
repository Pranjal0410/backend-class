/**
 * ConnectionStatus Component
 * Shows socket connection state with tooltips
 *
 * Displays:
 * - Connected: green dot
 * - Connecting: yellow dot + "Connecting..."
 * - Disconnected: red dot + "Disconnected"
 *
 * WHY SHOW THIS:
 * - Users need to know if their actions will work
 * - Disconnected state explains why updates aren't appearing
 * - Reinforces the real-time nature of the system
 */
import { useSocketStore } from '../stores';

export function ConnectionStatus() {
  const isConnected = useSocketStore((state) => state.isConnected);
  const isConnecting = useSocketStore((state) => state.isConnecting);
  const error = useSocketStore((state) => state.connectionError);

  if (isConnected) {
    return (
      <div
        className="flex items-center gap-2 text-sm cursor-default"
        title="Real-time updates are active"
      >
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-green-700">Connected</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div
        className="flex items-center gap-2 text-sm cursor-default"
        title="Establishing connection to server..."
      >
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-yellow-700">Connecting...</span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 text-sm cursor-default"
      title="Waiting for server connection. Some features may be unavailable."
    >
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-red-700">{error || 'Disconnected'}</span>
    </div>
  );
}

export default ConnectionStatus;
