import React, { Component, lazy, Suspense, useCallback, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { loginUser, registerUser } from './components/api';
import './index.css';

const AuthPage = lazy(() => import('./pages/AuthPage.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const WorkspaceLayout = lazy(() => import('./pages/WorkspaceLayout.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'));

class PageErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('A page could not be loaded:', error);
  }

  render() {
    if (this.state.hasError) {
      return <main className="app-shell"><div className="app-frame">
        <p className="error-message" role="alert">This page could not be loaded. Refresh to try again.</p>
      </div></main>;
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('userRole') || 'user');
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [password, setPassword] = useState('');
  const [authRole, setAuthRole] = useState('user');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const submitAuth = async (event, isRegistration = false) => {
    event.preventDefault();
    if (isAuthenticating) return;
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address, such as you@example.com.');
      return;
    }
    if (isRegistration && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsAuthenticating(true);
    try {
      const json = isRegistration
        ? await registerUser(normalizedEmail, password, authRole)
        : await loginUser(normalizedEmail, password);
      if (!json.token || !json.user?.email) {
        throw new Error('The server returned an invalid authentication response.');
      }
      const nextRole = json.user.role === 'admin' ? 'admin' : 'user';
      if (!isRegistration && nextRole !== authRole) {
        throw new Error(authRole === 'admin'
          ? 'This account does not have administrator access.'
          : 'This is an administrator account. Choose Admin to continue.');
      }
      if (isRegistration && nextRole !== authRole) {
        throw new Error(`The server created this account as ${nextRole === 'admin' ? 'Admin' : 'User'}, not ${authRole === 'admin' ? 'Admin' : 'User'}. Restart the updated backend and try again.`);
      }
      localStorage.setItem('token', json.token);
      localStorage.setItem('userEmail', json.user.email);
      localStorage.setItem('userRole', nextRole);
      setToken(json.token);
      setRole(nextRole);
      setEmail(json.user.email);
      setPassword('');
    } catch (err) {
      setError(err.message || 'Cannot connect to the task server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setToken(null);
    setRole('user');
    setEmail('');
    setPassword('');
    setAuthRole('user');
    setError('');
  }, []);

  const fallback = <main className="app-shell"><div className="app-frame">
    <p className="empty-state" role="status">Loading page...</p>
  </div></main>;

  return <PageErrorBoundary><Suspense fallback={fallback}>
    <Routes>
      <Route path="/login" element={token
        ? <Navigate to="/" replace />
        : <AuthPage
            authRole={authRole} setAuthRole={setAuthRole}
            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
            error={error} setError={setError} isAuthenticating={isAuthenticating} submitAuth={submitAuth} />} />
      <Route path="/register" element={token
        ? <Navigate to="/" replace />
        : <AuthPage isRegistration
            authRole={authRole} setAuthRole={setAuthRole}
            email={email} setEmail={setEmail} password={password} setPassword={setPassword}
            error={error} setError={setError} isAuthenticating={isAuthenticating}
            submitAuth={(event) => submitAuth(event, true)} />} />
      <Route element={token
        ? <WorkspaceLayout token={token} onLogout={handleLogout} />
        : <Navigate to="/login" replace />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="admin" element={<AdminPage role={role} />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  </Suspense></PageErrorBoundary>;
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>;
}
