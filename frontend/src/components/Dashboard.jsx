import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceList from './ServiceList';
import AddService from './AddService';
import { getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const fetchServices = useCallback(async () => {
    try {
      const response = await getServices();
      console.log('API Response:', response.data); // Debug log
      setServices(response.data);
      setError('');
      setLastUpdate(new Date());
    } catch (err) {
      console.error('API Error:', err.response || err); // Debug log
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
      console.log('Fetching services...'); // Debug log
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
      <header>
        <div>
          <h1>Dashboard</h1>
          <p className="welcome-message">Welcome, {user?.username}!</p>
          {lastUpdate && (
            <p className="last-update">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button onClick={logout} className="logout-button">Logout</button>
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
        />
      )}
    </div>
  );
}

export default Dashboard; 