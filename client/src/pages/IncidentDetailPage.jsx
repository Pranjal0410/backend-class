/**
 * Incident Detail Page
 * THE MOST IMPORTANT PAGE - This sells the project
 *
 * DEMONSTRATES:
 * - Real-time updates via Socket.io
 * - Presence awareness (who's viewing)
 * - Focus indicators (who's editing what)
 * - Server-authoritative state (no optimistic updates)
 * - Role-based UI degradation
 * - Immutable audit timeline
 *
 * LAYOUT:
 * ┌──────────────────────────────────────┐
 * │ Presence Bar                         │
 * ├──────────────────────────────────────┤
 * │ Status | Severity | Commander        │
 * ├──────────────────────────────────────┤
 * │ Notes Panel        | Action Items    │
 * │ (with focus)       | (with focus)    │
 * ├──────────────────────────────────────┤
 * │ Audit Timeline                       │
 * └──────────────────────────────────────┘
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useIncidentStore, useAuthStore } from '../stores';
import { useIncidentRoom } from '../hooks';
import {
  PresenceIndicator,
  StatusSelector,
  NoteInput,
  ActionItemList,
  RoleBadge,
  AssignResponder,
  IncidentMetaStrip
} from '../components';
import { AuditTimeline } from '../components/AuditTimeline';
import { ConnectionStatus } from '../components/ConnectionStatus';

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981'
};

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Join incident room and fetch data
  const { isLoading, error } = useIncidentRoom(id);

  // Get incident data from store
  const incident = useIncidentStore((state) => state.activeIncident);
  const updates = useIncidentStore((state) => state.activeIncidentUpdates);

  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading incident...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/incidents')}
            className="text-blue-600 hover:underline"
          >
            ← Back to incidents
          </button>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Incident not found</div>
      </div>
    );
  }

  return (
    <div className="incident-detail-page min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/incidents')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold">{incident.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <span className="text-gray-600">{user?.name}</span>
              <RoleBadge />
            </div>
          </div>
        </div>
      </header>

      {/* Presence Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <PresenceIndicator incidentId={id} />
        </div>
      </div>

      {/* Incident Meta Strip */}
      <IncidentMetaStrip incident={incident} updates={updates} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Status Row */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Status
              </label>
              <StatusSelector incidentId={id} currentStatus={incident.status} />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Severity
              </label>
              <span
                className="inline-flex px-3 py-1 text-sm font-medium rounded-full text-white"
                style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
              >
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
              </span>
            </div>

            {/* Commander */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Commander
              </label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {incident.commander?.name?.charAt(0) || '?'}
                </div>
                <span className="font-medium">
                  {incident.commander?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {incident.description && (
            <div className="mt-6 pt-6 border-t">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Description
              </label>
              <p className="text-gray-700">{incident.description}</p>
            </div>
          )}
        </div>

        {/* Notes & Action Items Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Notes Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Investigation Notes</h3>
            <NoteInput incidentId={id} />
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {updates
                .filter((u) => u.type === 'note')
                .map((note) => (
                  <div key={note._id} className="border-l-2 border-blue-300 pl-3 py-1">
                    <p className="text-gray-800">{note.content.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {note.userId?.name || 'Unknown'} •{' '}
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              {updates.filter((u) => u.type === 'note').length === 0 && (
                <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
                  <p className="font-medium text-gray-600 mb-1">No findings recorded yet</p>
                  <p className="text-gray-400">Add observations, logs, or hypotheses during investigation.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Items Panel */}
          <div className="bg-white rounded-lg shadow p-6">
            <ActionItemList incidentId={id} />
          </div>
        </div>

        {/* Assignees */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Assigned Responders</h3>
          {incident.assignees && incident.assignees.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {incident.assignees.map((assignee) => (
                <div
                  key={assignee._id}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                    {assignee.name?.charAt(0) || '?'}
                  </div>
                  <span className="text-sm">{assignee.name}</span>
                  <span className="text-xs text-gray-400">Working</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No responders assigned</p>
          )}

          {/* Admin-only assignment control */}
          <AssignResponder incidentId={id} currentAssignees={incident.assignees || []} />
        </div>

        {/* Audit Timeline */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Audit Timeline</h3>
          <AuditTimeline updates={updates} />
        </div>
      </main>
    </div>
  );
}

export default IncidentDetailPage;
