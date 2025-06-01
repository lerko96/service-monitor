import { useState } from 'react';
import { deleteService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationDialog from './ConfirmationDialog';
import { useToast } from './Toast';

function ServiceList({ services, onServiceDeleted, isRefreshing }) {
  const { success, error: showError } = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getStatusColor = (service) => {
    if (!service.latest_check) return 'gray';
    if (!service.latest_check.is_up) return 'red';
    return service.latest_check.response_time > 5000 ? 'yellow' : 'green';
  };

  const handleDeleteClick = (service) => {
    setConfirmDelete(service);
  };

  const handleDelete = async () => {
    const serviceId = confirmDelete.id;
    setDeletingId(serviceId);
    setError('');

    try {
      await deleteService(serviceId);
      success(`Service "${confirmDelete.name}" deleted successfully`);
      onServiceDeleted();
    } catch (err) {
      const errorMessage = `Failed to delete service: ${err.response?.data?.message || 'Unknown error'}`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  if (services.length === 0) {
    return (
      <div className="empty-state">
        <p>No services added yet. Add your first service above!</p>
      </div>
    );
  }

  return (
    <div className="service-list">
      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => setError('')}
            className="close-button"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      
      <div className={`services-grid ${isRefreshing ? 'refreshing' : ''}`}>
        {services.map((service) => (
          <div 
            key={service.id} 
            className={`service-card status-${getStatusColor(service)}`}
          >
            <div className="service-header">
              <h3>{service.name}</h3>
              <button
                onClick={() => handleDeleteClick(service)}
                disabled={deletingId === service.id}
                className="delete-button"
                aria-label={`Delete ${service.name}`}
              >
                {deletingId === service.id ? (
                  <LoadingSpinner size="small" />
                ) : (
                  '×'
                )}
              </button>
            </div>
            
            <p className="service-url" title={service.url}>{service.url}</p>
            
            <div className="service-status">
              {service.latest_check ? (
                <>
                  <div className="status-badge">
                    {service.latest_check.is_up ? 'UP' : 'DOWN'}
                  </div>
                  <div className="response-time">
                    {service.latest_check.response_time}ms
                  </div>
                  <div className="last-checked">
                    Last checked: {new Date(service.latest_check.checked_at).toLocaleTimeString()}
                  </div>
                </>
              ) : (
                <div className="status-badge unknown">
                  NOT CHECKED YET
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={!!confirmDelete}
        title="Delete Service"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        isDestructive={true}
      />
    </div>
  );
}

export default ServiceList; 