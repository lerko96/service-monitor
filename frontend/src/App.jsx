import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import UserMenu from './components/UserMenu';
import { useAuth } from './context/AuthContext';
import './index.css';
import './App.css';

function AppHeader() {
  const { isAuthenticated } = useAuth();
  
  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Service Monitor</h1>
      </div>
      <div className="header-center">
        {/* Reserved for future navigation */}
      </div>
      <div className="header-right">
        {isAuthenticated && <UserMenu />}
      </div>
    </header>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="app">
                <AppHeader />
                <main className="app-main">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
                <footer className="app-footer">
                  <p>&copy; {new Date().getFullYear()} Service Monitor. All rights reserved.</p>
                </footer>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
