/**
 * Incident List Page (Dashboard)
 * Dashboard showing stats, charts, and incident list
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidentStore, useAuthStore } from '../stores';
import { incidentApi } from '../services/api';
import {
  WriteGate,
  AppLayout,
  StatCard,
  IncidentTrendChart,
  SeverityDistribution
} from '../components';

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981'
};

const STATUS_COLORS = {
  investigating: '#EF4444',
  identified: '#F59E0B',
  monitoring: '#3B82F6',
  resolved: '#10B981'
};

export function IncidentListPage() {
  const navigate = useNavigate();
  const incidents = useIncidentStore((state) => state.incidents);
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const setIncidentsError = useIncidentStore((state) => state.setIncidentsError);
  const isLoading = useIncidentStore((state) => state.incidentsLoading);
  const error = useIncidentStore((state) => state.incidentsError);
  const setLoading = useIncidentStore((state) => state.setIncidentsLoading);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      try {
        const { incidents } = await incidentApi.list();
        setIncidents(incidents);
      } catch (err) {
        setIncidentsError(err.message);
      }
    };

    fetchIncidents();
  }, []);

  // Filter incidents based on search query
  const filteredIncidents = incidents.filter(incident => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      incident.title?.toLowerCase().includes(query) ||
      incident.description?.toLowerCase().includes(query) ||
      incident.status?.toLowerCase().includes(query) ||
      incident.severity?.toLowerCase().includes(query) ||
      incident.commander?.name?.toLowerCase().includes(query)
    );
  });

  // Calculate stats (from all incidents, not filtered)
  const stats = {
    total: incidents.length,
    active: incidents.filter(i => i.status !== 'resolved').length,
    critical: incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length,
    resolved: incidents.filter(i => i.status === 'resolved').length
  };

  return (
    <AppLayout title="Dashboard" searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          label="Total Incidents"
          value={stats.total}
          variant="accent"
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Active Incidents"
          value={stats.active}
          variant="high"
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          label="Critical Active"
          value={stats.critical}
          variant="critical"
        />
        <StatCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Resolved"
          value={stats.resolved}
          variant="low"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <IncidentTrendChart />
        <SeverityDistribution incidents={incidents} />
      </div>

      {/* Incidents Table Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-primary">Recent Incidents</h2>
        <WriteGate>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn--primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Incident
          </button>
        </WriteGate>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-500 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-8 text-secondary">
          <div className="animate-spin inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full mb-4"></div>
          <p>Loading incidents...</p>
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state__icon mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="empty-state__title">{searchQuery ? 'No matching incidents' : 'No incidents found'}</p>
          <p className="empty-state__description">{searchQuery ? 'Try a different search term.' : 'Create your first incident to get started.'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Commander</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr
                  key={incident._id}
                  onClick={() => navigate(`/incidents/${incident._id}`)}
                  className="cursor-pointer"
                >
                  <td>
                    <div className="font-medium">{incident.title}</div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${SEVERITY_COLORS[incident.severity]}20`,
                        color: SEVERITY_COLORS[incident.severity]
                      }}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        backgroundColor: `${STATUS_COLORS[incident.status]}20`,
                        color: STATUS_COLORS[incident.status]
                      }}
                    >
                      {incident.status}
                    </span>
                  </td>
                  <td className="text-secondary">
                    {incident.commander?.name || 'Unassigned'}
                  </td>
                  <td className="text-secondary text-sm">
                    {new Date(incident.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateIncidentModal onClose={() => setShowCreateModal(false)} />
      )}
    </AppLayout>
  );
}

/**
 * Create Incident Modal
 */
function CreateIncidentModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addIncident = useIncidentStore((state) => state.addIncident);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { incident } = await incidentApi.create({ title, description, severity });
      addIncident(incident);
      onClose();
      navigate(`/incidents/${incident._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal__header">
          <h3 className="modal__title">Create New Incident</h3>
          <button onClick={onClose} className="modal__close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-500 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Brief incident description"
            />
          </div>

          <div>
            <label className="label">Severity *</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="select"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="textarea"
              placeholder="Detailed description..."
            />
          </div>

          <div className="modal__footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="btn btn--primary"
            >
              {isLoading ? 'Creating...' : 'Create Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default IncidentListPage;
