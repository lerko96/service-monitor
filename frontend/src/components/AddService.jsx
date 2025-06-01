import { useState } from 'react';
import { addService } from '../services/api';
import { useToast } from './Toast';

function AddService({ onServiceAdded }) {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({ name: '', url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!formData.name.trim()) {
      setError('Service name is required');
      showError('Service name is required');
      return;
    }

    if (!formData.url.trim() || !validateUrl(formData.url)) {
      setError('Please enter a valid URL (including http:// or https://)');
      showError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    setLoading(true);
    try {
      await addService(formData);
      success('Service added successfully!');
      onServiceAdded();
      setFormData({ name: '', url: '' });
      setShowForm(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add service';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user types
  };

  if (!showForm) {
    return (
      <div className="add-service-button-container">
        <button 
          onClick={() => setShowForm(true)}
          className="add-service-button"
        >
          + Add New Service
        </button>
      </div>
    );
  }

  return (
    <div className="add-service-form">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>Add New Service</h2>
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            className="close-button"
          >
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Service Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., My Website"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">Service URL:</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="primary"
          >
            {loading ? 'Adding...' : 'Add Service'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddService; 