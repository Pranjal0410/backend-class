/**
 * StatCard Component
 * Summary card with icon, label, value, and optional trend
 */

export function StatCard({ icon, label, value, trend, variant = 'accent' }) {
  const getTrendIndicator = () => {
    if (!trend) return null;

    const isPositive = trend > 0;
    const isNegative = trend < 0;

    return (
      <div className={`stat-card__trend ${
        isPositive ? 'stat-card__trend--up' :
        isNegative ? 'stat-card__trend--down' :
        'stat-card__trend--neutral'
      }`}>
        {isPositive && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
        {isNegative && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
        <span>{Math.abs(trend)}%</span>
      </div>
    );
  };

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <div className={`stat-card__icon stat-card__icon--${variant}`}>
          {icon}
        </div>
        {getTrendIndicator()}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export default StatCard;
