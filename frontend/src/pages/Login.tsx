import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  KeyRound,
  Shield,
} from 'lucide-react';

interface LoginProps {
  onNavigate: (page: string) => void;
  initialTab?: 'signin' | 'register';
}

export const Login: React.FC<LoginProps> = ({ onNavigate, initialTab = 'signin' }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (tab === 'signin') {
      if (!email.trim() || !password) {
        setErrorMessage('Please fill in both email and password.');
        return;
      }

      setLoading(true);
      const res = await login(email.trim(), password);
      setLoading(false);

      if (res.success) {
        onNavigate('dashboard');
      } else {
        setErrorMessage(res.message || 'Login failed. Please verify your credentials.');
      }
    } else {
      // Register
      if (!name.trim() || !email.trim() || !password) {
        setErrorMessage('Please fill in all registration fields.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await register(name.trim(), email.trim(), password, confirmPassword);
      setLoading(false);

      if (res.success) {
        setSuccessMessage('Account created successfully! Entering workspace...');
        setTimeout(() => {
          onNavigate('dashboard');
        }, 800);
      } else {
        setErrorMessage(res.message || 'Registration failed.');
      }
    }
  };

  const handleFillDemoUser = () => {
    setEmail('user@taskmanager.com');
    setPassword('User@123456');
    setTab('signin');
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin@taskmanager.com');
    setPassword('Admin@123456');
    setTab('signin');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#1F0D2B] via-[#2F1542] to-[#451B5C] relative overflow-hidden">
      {/* Subtle background glow accents matching the dark purple theme */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#7041A5]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#B34D91]/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Brand Lockup */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7041A5] to-[#B34D91] shadow-lg mb-3 ring-4 ring-white/10">
            <CheckSquare className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Task Manager
          </h1>
          <p className="text-xs text-[#E9D5EF]/80 mt-1">
            Organize, prioritize, and track your projects with elegance
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          {/* Tab Switcher */}
          <div className="flex p-1 bg-[#F0E5F8] rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-white text-[#38234C] shadow-xs'
                  : 'text-[#987BAA] hover:text-[#463353]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-[#38234C] shadow-xs'
                  : 'text-[#987BAA] hover:text-[#463353]'
              }`}
            >
              Register
            </button>
          </div>

          {/* Alert notifications */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Vidhi Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#463353] uppercase tracking-wider">
                  Password
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-xs font-semibold text-[#B34D91] hover:text-[#9b3d7a] transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#987BAA] hover:text-[#463353] absolute right-3 top-1/2 -translate-y-1/2 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Enter Workspace' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill helpers for evaluation */}
          <div className="mt-6 pt-5 border-t border-[#E9D5EF]">
            <p className="text-[11px] text-[#987BAA] text-center font-semibold uppercase tracking-wider mb-2.5">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9D5EF] bg-[#F8F3FC] hover:bg-[#F0E5F8] text-[11px] font-bold text-[#7041A5] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-[#B34D91]" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={handleFillDemoUser}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9D5EF] bg-[#F8F3FC] hover:bg-[#F0E5F8] text-[11px] font-bold text-[#463353] transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#7041A5]" />
                <span>Member Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#E9D5EF]/70 mt-6">
          Task Management System · © 2026 Task Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
