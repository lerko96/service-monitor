import { useState } from 'react';
import { deleteService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ConfirmationDialog from './ConfirmationDialog';
import { useToast } from './Toast';
import ServiceCard from './ServiceCard';

function ServiceList({ services, onServiceDeleted, isRefreshing }) {
  const { success, error: showError } = useToast();
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

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
    <div>
      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={() => setError('')}
            className="close-button"
            aria-label="Dismiss error"
          >
            <span>&times;</span>
          </button>
        </div>
      )}
      
      <div className={`services-grid ${isRefreshing ? 'refreshing' : ''}`}>
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onDelete={() => handleDeleteClick(service)}
          />
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