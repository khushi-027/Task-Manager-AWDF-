import React, { useState } from 'react';
import api from '../services/api';
import { Mail, Send, CheckCircle2, AlertCircle, MessageSquare, User, HelpCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please complete all fields before submitting.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/contact', {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Your message has been sent successfully.');
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit contact message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center max-w-xl mx-auto mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B34D91]">
          Support & Feedback
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#38234C] mt-1">
          Contact Workspace Support
        </h1>
        <p className="text-xs text-[#987BAA] mt-2 leading-relaxed">
          Have inquiries regarding task workflows, administrative features, or AI configuration?
          Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E9D5EF] shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2F8] flex items-center justify-center text-[#B34D91]">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#38234C]">Direct Email</h3>
              <p className="text-xs text-[#987BAA]">support@taskmanager.internal</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-[#F0E5F8]">
            <div className="w-10 h-10 rounded-2xl bg-[#F0E5F8] flex items-center justify-center text-[#7041A5]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#38234C]">System FAQ</h3>
              <p className="text-xs text-[#987BAA]">QNA: Task Manager.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F8F3FC] border border-[#E9D5EF] text-[11px] text-[#463353] leading-relaxed mt-4">
            <span className="font-bold text-[#7041A5] block mb-1">Local Development Note</span>
            Inquiries submitted through this form are logged securely to the backend data repository and accessible by administrators.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#E9D5EF] shadow-xs">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#987BAA] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ash Ketchum"
                    required
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding Groq API task generation"
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Write your inquiry or feedback in detail..."
                required
                className="w-full px-3 py-2 rounded-xl border border-[#E9D5EF] text-xs font-medium text-[#463353] focus:outline-hidden focus:ring-2 focus:ring-[#7041A5]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
