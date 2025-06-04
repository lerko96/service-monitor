import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceList from './ServiceList';
import AddService from './AddService';
import ViewToggle from './ViewToggle';
import { getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [userViewPreference, setUserViewPreference] = useState('grid');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Actual view mode (force list on mobile, respect user preference otherwise)
  const viewMode = isMobile ? 'list' : userViewPreference;

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedViewMode = localStorage.getItem('serviceViewMode');
    if (savedViewMode && (savedViewMode === 'grid' || savedViewMode === 'list')) {
      setUserViewPreference(savedViewMode);
    }
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((newViewMode) => {
    setUserViewPreference(newViewMode);
    localStorage.setItem('serviceViewMode', newViewMode);
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const response = await getServices();
      setServices(response.data);
      setError('');
      setLastUpdate(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to fetch services. ' + (err.response?.data?.message || err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  // Initial fetch
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchServices();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchServices]);

  const handleServiceAdded = () => {
    fetchServices();
  };

  const handleServiceDeleted = () => {
    fetchServices();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <h2>Service Dashboard</h2>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="dashboard-header-right">
          <ViewToggle 
            viewMode={userViewPreference}
            onViewModeChange={handleViewModeChange}
            isMobile={isMobile}
          />
        </div>
      </header>
      
      <AddService onServiceAdded={handleServiceAdded} />
      
      {error && (
        <div className="error-message">
          {error}
          <button 
            onClick={fetchServices} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}
      
      {loading && !services.length ? (
        <div className="loading-message">Loading services...</div>
      ) : (
        <ServiceList 
          services={services} 
          onServiceDeleted={handleServiceDeleted}
          isRefreshing={loading}
          viewMode={viewMode}
        />
      )}
    </div>
  );
}

export default Dashboard; 