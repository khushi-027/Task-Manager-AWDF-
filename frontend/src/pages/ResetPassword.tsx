import React, { useState } from 'react';
import api from '../services/api';
import { Lock, KeyRound, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface ResetPasswordProps {
  onNavigate: (page: string) => void;
  token?: string;
  email?: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({
  onNavigate,
  token: initialToken = '',
  email: initialEmail = '',
}) => {
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage('Reset token is missing or invalid.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
        confirmPassword,
      });

      if (res.data?.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#1F0D2B] via-[#2F1542] to-[#451B5C] relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7041A5] hover:text-[#B34D91] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#38234C]">Create New Password</h1>
            <p className="text-xs text-[#987BAA] mt-1">
              {initialEmail ? `Account: ${initialEmail}` : 'Enter your reset token and new credentials'}
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-[#38234C]">Password Updated!</h2>
              <p className="text-xs text-[#987BAA]">
                Your account password has been updated securely. You can now sign in with your new password.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!initialToken && (
                <div>
                  <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                    Security Reset Token
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Paste reset token here"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9D5EF] text-sm text-[#463353] bg-[#F8F3FC]/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Save New Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
