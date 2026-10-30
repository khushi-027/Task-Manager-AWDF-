import React, { useState } from 'react';
import api from '../services/api';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetToken?: string; resetUrl?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data?.success) {
        setSuccessInfo({
          message: res.data.message,
          resetToken: res.data.resetToken,
          resetUrl: res.data.resetUrl,
        });
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to dispatch reset request.');
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
            <h1 className="text-xl font-bold text-[#38234C]">Reset Your Password</h1>
            <p className="text-xs text-[#987BAA] mt-1">
              Enter your email address to receive password recovery instructions
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Reset Instructions Issued</span>
                </div>
                <p className="leading-relaxed">{successInfo.message}</p>
              </div>

              {/* Local Development Quick Link Helper */}
              {successInfo.resetToken && (
                <div className="p-4 rounded-2xl bg-[#FFF2F8] border border-[#F2CBE2] text-xs">
                  <p className="font-bold text-[#7041A5] mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-[#B34D91]" />
                    <span>Local Development Reset Helper</span>
                  </p>
                  <p className="text-[#463353] text-[11px] mb-3">
                    A secure cryptographic reset token was created for this session. Click below to continue directly:
                  </p>
                  <button
                    onClick={() =>
                      onNavigate('reset-password', {
                        token: successInfo.resetToken || '',
                        email,
                      })
                    }
                    className="w-full py-2 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Proceed to Reset Password Page
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  Registered Email
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Generate Reset Link</span>
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

export default ForgotPassword;
