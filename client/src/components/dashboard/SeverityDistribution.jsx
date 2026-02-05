/**
 * SeverityDistribution Component
 * Pie/donut chart showing incidents by severity using Recharts
 */
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#10b981'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div style={{
        backgroundColor: '#242424',
        border: '1px solid #333',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
      }}>
        <p style={{ color: data.payload.fill, fontWeight: 500, textTransform: 'capitalize' }}>
          {data.name}: {data.value}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {payload.map((entry, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '0.25rem',
              backgroundColor: entry.color
            }}
          />
          <span style={{ color: '#a0a0a0', fontSize: '0.875rem', textTransform: 'capitalize' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function SeverityDistribution({ incidents = [] }) {
  // Calculate severity distribution from incidents
  const severityCounts = incidents.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(severityCounts).map(([name, value]) => ({
    name,
    value,
    fill: SEVERITY_COLORS[name] || '#6b7280'
  }));

  // If no data, show placeholder
  if (data.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-container__header">
          <h3 className="chart-container__title">Severity Distribution</h3>
        </div>
        <div className="empty-state" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className="empty-state__description">No incidents to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-container__header">
        <h3 className="chart-container__title">Severity Distribution</h3>
      </div>
      <div style={{ height: '200px', display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1 }}>
          <CustomLegend payload={data.map(d => ({ value: d.name, color: d.fill }))} />
        </div>
      </div>
    </div>
  );
}

export default SeverityDistribution;
