import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="user-menu">
      <button 
        className="user-menu-trigger" 
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="username">{user?.username}</span>
        <span className="chevron">{isOpen ? '▼' : '▲'}</span>
      </button>
      
      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-info">
            <span className="user-label">Signed in as</span>
            <strong>{user?.username}</strong>
          </div>
          <div className="menu-divider" />
          <div className="theme-toggle-wrapper">
            <span>Theme</span>
            <ThemeToggle />
          </div>
          <div className="menu-divider" />
          <button onClick={logout} className="logout-button">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu; 