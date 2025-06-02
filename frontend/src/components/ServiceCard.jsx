import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const ServiceCard = ({ service, onDelete }) => {
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
    return formatDistanceToNow(new Date(latestCheck.checked_at), { addSuffix: true });
  };

  return (
    <div className={`service-card ${getStatusClass(service.latest_check)}`}>
      <div className="service-header">
        <h3>{service.name}</h3>
        <button
          onClick={() => onDelete(service.id)}
          className="close-button"
          aria-label="Delete service"
        >
          ×
        </button>
      </div>
      
      <p className="service-url">{service.url}</p>
      
      <div className="service-status">
        <div className="status-info">
          <span className="status-badge">{getStatusText(service.latest_check)}</span>
          {service.latest_check?.response_time && (
            <span className="response-time">{service.latest_check.response_time}ms</span>
          )}
        </div>
        <p className="last-checked">
          Last checked: {formatLastChecked(service.latest_check)}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard; 