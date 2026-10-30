import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  onNavigate?: (page: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
  onNavigate,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#7041A5] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-[#987BAA] font-medium">Verifying workspace session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onNavigate) {
      onNavigate('login');
      return null;
    }
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-[#E9D5EF] text-center shadow-xs">
        <h3 className="text-base font-bold text-[#38234C] mb-2">Authentication Required</h3>
        <p className="text-xs text-[#987BAA] mb-4">
          Please sign in to access your task workspace.
        </p>
      </div>
    );
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 text-center shadow-xs">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-[#38234C] mb-2">Access Denied (403)</h2>
        <p className="text-xs text-[#987BAA] mb-6 leading-relaxed">
          The Administrator Dashboard requires verified administrative privileges. Your current
          account has standard Member permissions.
        </p>
        {onNavigate && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7041A5] text-white text-xs font-bold hover:bg-[#5d338e] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Tasks Dashboard</span>
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
