/**
 * Incident List Page
 * Dashboard showing all incidents
 *
 * PURPOSE: Demonstrate REST + navigation separation from live behavior
 *
 * FLOW:
 * 1. GET /api/incidents on mount
 * 2. Display in table/list
 * 3. Click incident → navigate to /incidents/:id
 * 4. "Create Incident" button (admin/responder only)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidentStore, useAuthStore } from '../stores';
import { incidentApi } from '../services/api';
import { WriteGate, RoleBadge } from '../components';

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

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="incident-list-page min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Incident Response Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <RoleBadge />
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Active Incidents</h2>
          <WriteGate>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              + Create Incident
            </button>
          </WriteGate>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No incidents found</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commander
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <tr
                    key={incident._id}
                    onClick={() => navigate(`/incidents/${incident._id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{incident.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: SEVERITY_COLORS[incident.severity] }}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: STATUS_COLORS[incident.status] }}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {incident.commander?.name || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                      {new Date(incident.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateIncidentModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h3 className="text-xl font-semibold mb-4">Create New Incident</h3>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief incident description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
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
