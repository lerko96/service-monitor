import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from '../components/Toast';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      let response;
      if (isRegistering) {
        response = await registerApi({
          username: formData.username,
          password: formData.password
        });
        addToast('Registration successful! Please log in.', 'success');
        setIsRegistering(false);
      } else {
        response = await loginApi({
          username: formData.username,
          password: formData.password
        });
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(isRegistering ? 'Registration error:' : 'Login error:', err);
      setError(err.response?.data?.error || `Failed to ${isRegistering ? 'register' : 'login'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Register New Account' : 'Service Monitor Login'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            autoComplete="username"
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete={isRegistering ? 'new-password' : 'current-password'}
            disabled={loading}
          />
        </div>
        {isRegistering && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        )}
        {error && <div className="error-message">{error}</div>}
        <button 
          type="submit" 
          disabled={loading}
          className="login-button"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span>{isRegistering ? 'Registering...' : 'Logging in...'}</span>
            </>
          ) : (
            isRegistering ? 'Register' : 'Login'
          )}
        </button>
      </form>
      <button 
        onClick={toggleMode} 
        className="toggle-mode-button"
        disabled={loading}
      >
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>
    </div>
  );
}

export default Login; 