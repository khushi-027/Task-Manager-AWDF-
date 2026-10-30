import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  // Sync with browser hash for seamless bookmarking & navigation
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const [path, queryString] = rawHash.split('?');
      const params: Record<string, string> = {};

      if (queryString) {
        const searchParams = new URLSearchParams(queryString);
        searchParams.forEach((val, key) => {
          params[key] = val;
        });
      }

      setPageParams(params);

      if (path) {
        setCurrentPage(path);
      } else {
        setCurrentPage(isAuthenticated ? 'dashboard' : 'login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const navigateTo = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    let hash = `#/${page}`;
    const query = new URLSearchParams(params).toString();
    if (query) hash += `?${query}`;
    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3FC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7041A5] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-[#38234C]">Loading Task Manager...</span>
        </div>
      </div>
    );
  }

  // Auth pages (no main navbar)
  if (currentPage === 'login' || (!isAuthenticated && currentPage !== 'forgot-password' && currentPage !== 'reset-password')) {
    return <Login onNavigate={navigateTo} />;
  }

  if (currentPage === 'forgot-password') {
    return <ForgotPassword onNavigate={navigateTo} />;
  }

  if (currentPage === 'reset-password') {
    return (
      <ResetPassword
        onNavigate={navigateTo}
        token={pageParams.token || ''}
        email={pageParams.email || ''}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F3FC] text-[#463353]">
      {/* Workspace Navbar */}
      <Navbar activePage={currentPage} onNavigate={navigateTo} />

      {/* Main Viewport */}
      <main className="flex-1 pb-16">
        {currentPage === 'dashboard' && (
          <ProtectedRoute onNavigate={navigateTo}>
            <Dashboard />
          </ProtectedRoute>
        )}

        {currentPage === 'projects' && (
          <ProtectedRoute onNavigate={navigateTo}>
            <Projects />
          </ProtectedRoute>
        )}

        {currentPage === 'admin' && (
          <ProtectedRoute adminOnly onNavigate={navigateTo}>
            <Admin />
          </ProtectedRoute>
        )}

        {currentPage === 'contact' && (
          <ProtectedRoute onNavigate={navigateTo}>
            <Contact />
          </ProtectedRoute>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[#E9D5EF] bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#987BAA]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#38234C]">Task Manager</span>
            <span>·</span>
            <span>© 2026 Task Manager. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('dashboard')}
              className="hover:text-[#7041A5] transition-colors"
            >
              Tasks
            </button>
            <button
              onClick={() => navigateTo('projects')}
              className="hover:text-[#7041A5] transition-colors"
            >
              Projects
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="hover:text-[#7041A5] transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
