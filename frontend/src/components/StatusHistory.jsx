import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';

const StatusHistory = ({ history }) => {
  const getStatusColor = (check) => {
    if (!check || !check.is_up) {
      switch (check?.state) {
        case 'TIMEOUT':
          return '#ef4444'; // Red
        case 'RESTRICTED':
          return '#eab308'; // Yellow
        case 'SLOW':
          return '#f59e0b'; // Orange
        case 'DOWN':
        default:
          return '#ef4444'; // Red
      }
    }
    return '#22c55e'; // Green for UP
  };

  const getStatusText = (check) => {
    if (!check) return 'Unknown';
    return check.is_up ? 'UP' : (check.state || 'DOWN');
  };

  const formatTooltip = (check) => {
    if (!check) return 'No data';
    
    // SQLite CURRENT_TIMESTAMP returns UTC time without timezone indicator
    // If the timestamp doesn't include timezone info, treat it as UTC
    let date;
    if (check.checked_at.includes('T')) {
      // ISO format, might have timezone
      date = new Date(check.checked_at);
    } else {
      // SQLite format (YYYY-MM-DD HH:MM:SS), treat as UTC
      date = new Date(check.checked_at + ' UTC');
    }
    
    const timeAgo = formatDistanceToNow(date, { addSuffix: true });
    const exactTime = format(date, 'MMM dd, yyyy HH:mm:ss');
    return `${getStatusText(check)} - ${timeAgo}\n${exactTime}`;
  };

  if (!history || history.length === 0) {
    return (
      <div className="status-history">
        <div className="status-history-label">Recent History:</div>
        <div className="status-history-bars">
          <span className="no-history">No history available</span>
        </div>
      </div>
    );
  }

  // Calculate uptime percentage for the visible history
  const uptimeCount = history.filter(check => check && check.is_up).length;
  const uptimePercentage = history.length > 0 ? Math.round((uptimeCount / history.length) * 100) : 0;

  return (
    <div className="status-history">
      <div className="status-history-header">
        <div className="status-history-label">Recent History:</div>
        <div className="status-history-uptime">
          {uptimePercentage}% uptime ({history.length} checks)
        </div>
      </div>
      <div className="status-history-bars">
        {history.map((check, index) => (
          <div
            key={`${check.checked_at}-${index}`}
            className="status-bar"
            style={{ backgroundColor: getStatusColor(check) }}
            title={formatTooltip(check)}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusHistory; 