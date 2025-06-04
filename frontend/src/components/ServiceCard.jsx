import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import StatusHistory from './StatusHistory';

const ServiceCard = ({ service, onDelete, viewMode = 'grid', isDeleting = false }) => {
  const getStatusClass = (latestCheck) => {
    if (!latestCheck) return 'status-gray'; // Not checked yet
    
    switch (latestCheck.state) {
      case 'UP':
        return 'status-green';
      case 'RESTRICTED':
        return 'status-yellow';
      case 'SLOW':
        return 'status-orange';
      case 'TIMEOUT':
      case 'DOWN':
      default:
        return 'status-red';
    }
  };

  const getStatusText = (latestCheck) => {
    if (!latestCheck) return 'NOT CHECKED YET';
    return latestCheck.state;
  };

  const formatLastChecked = (latestCheck) => {
    if (!latestCheck || !latestCheck.checked_at) return '';
    
    // SQLite CURRENT_TIMESTAMP returns UTC time without timezone indicator
    // If the timestamp doesn't include timezone info, treat it as UTC
    let date;
    if (latestCheck.checked_at.includes('T')) {
      // ISO format, might have timezone
      date = new Date(latestCheck.checked_at);
    } else {
      // SQLite format (YYYY-MM-DD HH:MM:SS), treat as UTC
      date = new Date(latestCheck.checked_at + ' UTC');
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const formatAverageResponseTime = (avgTime) => {
    if (avgTime === null || avgTime === undefined) return 'N/A';
    return `${avgTime}ms`;
  };

  const cardClass = viewMode === 'list' 
    ? `service-card-list ${getStatusClass(service.latest_check)}`
    : `service-card-grid ${getStatusClass(service.latest_check)}`;

  if (viewMode === 'list') {
    // Horizontal list layout
    return (
      <div className={cardClass}>
        <div className="service-main-info">
          <div className="service-header-list">
            <h3>{service.name}</h3>
            <span className="status-badge">{getStatusText(service.latest_check)}</span>
          </div>
          <p className="service-url-list">{service.url}</p>
        </div>
        
        <div className="service-metrics">
          <div className="metric-item">
            <span className="metric-label">Last Response:</span>
            <span className="metric-value">
              {service.latest_check?.response_time ? `${service.latest_check.response_time}ms` : 'N/A'}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Avg (10):</span>
            <span className="metric-value">
              {formatAverageResponseTime(service.last_10_avg_response_time)}
            </span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Last Checked:</span>
            <span className="metric-value">
              {formatLastChecked(service.latest_check)}
            </span>
          </div>
        </div>

        <div className="service-actions-list">
          <StatusHistory history={service.recent_history} />
          <button
            onClick={() => onDelete(service.id)}
            className="delete-button-list"
            disabled={isDeleting}
            aria-label="Delete service"
          >
            {isDeleting ? '...' : '×'}
          </button>
        </div>
      </div>
    );
  }

  // Grid layout (current vertical layout)
  return (
    <div className={cardClass}>
      <div className="service-header">
        <h3>{service.name}</h3>
        <button
          onClick={() => onDelete(service.id)}
          className="close-button"
          disabled={isDeleting}
          aria-label="Delete service"
        >
          {isDeleting ? '...' : '×'}
        </button>
      </div>
      
      <p className="service-url">{service.url}</p>
      
      <div className="service-metrics-grid">
        <div className="metric-item">
          <span className="metric-label">Last Response:</span>
          <span className="metric-value">
            {service.latest_check?.response_time ? `${service.latest_check.response_time}ms` : 'N/A'}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Avg (10):</span>
          <span className="metric-value">
            {formatAverageResponseTime(service.last_10_avg_response_time)}
          </span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Last Checked:</span>
          <span className="metric-value">
            {formatLastChecked(service.latest_check)}
          </span>
        </div>
      </div>
      
      <div className="service-status">
        <div className="status-info">
          <span className="status-badge">{getStatusText(service.latest_check)}</span>
        </div>
        
        <StatusHistory history={service.recent_history} />
      </div>
    </div>
  );
};

export default ServiceCard; 