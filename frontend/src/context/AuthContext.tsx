import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('task_manager_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('task_manager_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Verify stored token on initial mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('task_manager_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('task_manager_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        setToken(receivedToken);
        setUser(receivedUser);

        localStorage.setItem('task_manager_token', receivedToken);
        localStorage.setItem('task_manager_user', JSON.stringify(receivedUser));

        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Login failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Invalid login credentials.',
      };
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      if (res.data?.success) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        setToken(receivedToken);
        setUser(receivedUser);

        localStorage.setItem('task_manager_token', receivedToken);
        localStorage.setItem('task_manager_user', JSON.stringify(receivedUser));

        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data?.message || 'Registration failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('task_manager_token');
    localStorage.removeItem('task_manager_user');
    setToken(null);
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('task_manager_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
