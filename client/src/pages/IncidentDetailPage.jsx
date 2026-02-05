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
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useIncidentStore, useAuthStore } from '../stores';
import { useIncidentRoom } from '../hooks';
import {
  AppLayout,
  PresenceIndicator,
  StatusSelector,
  StatusProgression,
  NoteInput,
  ActionItemList,
  RoleBadge,
  AssignResponder,
  IncidentMetaStrip,
  ReadOnlyBanner,
  CopyIncidentSummary
} from '../components';
import { AuditTimeline } from '../components/AuditTimeline';

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
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full mb-4"></div>
            <p className="text-secondary">Loading incident...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => navigate('/incidents')}
              className="btn btn--secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!incident) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-secondary">Incident not found</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/incidents')}
            className="btn btn--ghost"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-primary">{incident.title}</h1>
          <CopyIncidentSummary incident={incident} updates={updates} />
        </div>
        <div className="flex items-center gap-3">
          <RoleBadge />
        </div>
      </div>

      {/* Read-only banner for viewers */}
      <ReadOnlyBanner />

      {/* Presence Bar */}
      <div className="panel mb-6" style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--accent-muted)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium text-accent">Live Session</span>
          </div>
          <div className="h-4 w-px bg-border-primary"></div>
          <PresenceIndicator incidentId={id} />
        </div>
      </div>

      {/* Incident Meta Strip */}
      <IncidentMetaStrip incident={incident} updates={updates} />

      {/* Status Row */}
      <div className="panel mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status */}
          <div>
            <label className="label">Status</label>
            <StatusSelector incidentId={id} currentStatus={incident.status} />
            <div className="mt-3">
              <StatusProgression currentStatus={incident.status} />
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="label">Severity</label>
            <span
              className="badge"
              style={{
                backgroundColor: `${SEVERITY_COLORS[incident.severity]}20`,
                color: SEVERITY_COLORS[incident.severity]
              }}
            >
              {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
            </span>
          </div>

          {/* Commander */}
          <div>
            <label className="label">Commander</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-medium">
                  {incident.commander?.name?.charAt(0) || '?'}
                </div>
                {incident.commander && (
                  <span className="absolute -top-1 -right-1 text-xs" title="Incident Commander">⭐</span>
                )}
              </div>
              <div>
                <span className="font-medium text-primary">
                  {incident.commander?.name || 'Unassigned'}
                </span>
                {incident.commander && (
                  <span className="text-xs text-muted ml-2">Commander</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <div className="mt-6 pt-6 border-t">
            <label className="label">Description</label>
            <p className="text-secondary">{incident.description}</p>
          </div>
        )}
      </div>

      {/* Notes & Action Items Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Notes Panel */}
        <div className="panel">
          <h3 className="text-lg font-semibold text-primary mb-4">Investigation Notes</h3>
          <NoteInput incidentId={id} />
          <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
            {updates
              .filter((u) => u.type === 'note')
              .map((note) => (
                <div key={note._id} className="border-l-2 border-accent pl-3 py-1">
                  <p className="text-primary">{note.content.text}</p>
                  <p className="text-xs text-muted mt-1">
                    {note.userId?.name || 'Unknown'} •{' '}
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            {updates.filter((u) => u.type === 'note').length === 0 && (
              <div className="empty-state">
                <p className="empty-state__title">No findings recorded yet</p>
                <p className="empty-state__description">Add observations, logs, or hypotheses during investigation.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Items Panel */}
        <div className="panel">
          <ActionItemList incidentId={id} />
        </div>
      </div>

      {/* Assignees */}
      <div className="panel mb-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Assigned Responders</h3>
        {incident.assignees && incident.assignees.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {incident.assignees.map((assignee) => (
              <div
                key={assignee._id}
                className="flex items-center gap-2 bg-tertiary px-3 py-1 rounded-full"
              >
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-medium">
                  {assignee.name?.charAt(0) || '?'}
                </div>
                <span className="text-sm text-primary">{assignee.name}</span>
                <span className="text-xs text-muted">Working</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="empty-state__title">No responders assigned</p>
            <p className="empty-state__description">Assign team members to coordinate incident response.</p>
          </div>
        )}

        {/* Admin-only assignment control */}
        <AssignResponder incidentId={id} currentAssignees={incident.assignees || []} />
      </div>

      {/* Audit Timeline */}
      <div className="panel">
        <h3 className="text-lg font-semibold text-primary mb-4">Audit Timeline</h3>
        <AuditTimeline updates={updates} />
      </div>
    </AppLayout>
  );
}

export default IncidentDetailPage;
