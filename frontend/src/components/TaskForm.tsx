import React, { useState } from 'react';
import api from '../services/api';
import { Plus, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onTaskCreated: (newTask: any) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiNotice, setAiNotice] = useState<{ text: string; provider?: string } | null>(null);

  const handleGenerateAIDescription = async () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a task title first so the AI can generate a relevant description.');
      return;
    }

    setErrorMessage('');
    setAiGenerating(true);
    setAiNotice(null);

    try {
      const response = await api.post('/ai/generate-description', {
        title: title.trim(),
        priority,
      });

      if (response.data?.success && response.data.description) {
        setDescription(response.data.description);
        setAiNotice({
          text: response.data.disclaimer || 'AI suggestion generated. You can edit this text before adding.',
          provider: response.data.provider,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not contact AI service. You can type a description manually.';
      setErrorMessage(msg);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/tasks', {
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'Pending',
      });

      if (res.data?.success && res.data.task) {
        onTaskCreated(res.data.task);
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setAiNotice(null);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to save task.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9D5EF] shadow-xs p-5 md:p-6 mb-8 transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[#38234C]">Create New Task</h2>
          <p className="text-xs text-[#987BAA]">
            Define action items with priority and optional AI-assisted descriptions.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FFF2F8] text-[#B34D91] border border-[#E9D5EF]">
          Active Board
        </span>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
              Task Title <span className="text-[#B34D91]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design responsive landing page mockup"
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-xl border border-[#E9D5EF] bg-[#F8F3FC]/50 text-sm text-[#463353] placeholder-[#987BAA]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#463353] uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E9D5EF] bg-white text-sm text-[#463353] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>
        </div>

        {/* Description & AI Generator */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-[#463353] uppercase tracking-wider">
              Description (Optional)
            </label>
            <button
              type="button"
              onClick={handleGenerateAIDescription}
              disabled={aiGenerating || !title.trim()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7041A5] hover:text-[#B34D91] disabled:text-[#987BAA]/50 disabled:cursor-not-allowed transition-colors"
              title="Generate a smart actionable description using Groq AI"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7041A5]" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#B34D91]" />
                  <span>Generate with AI (Groq)</span>
                </>
              )}
            </button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant notes, checklist items, or deliverables..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9D5EF] bg-[#F8F3FC]/50 text-sm text-[#463353] placeholder-[#987BAA]/60 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#7041A5] focus:border-transparent transition-all"
          />

          {aiNotice && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#7041A5] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B34D91]"></span>
              <span>{aiNotice.text}</span>
              {aiNotice.provider && (
                <span className="text-[#987BAA]">({aiNotice.provider})</span>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#7041A5] hover:bg-[#5d338e] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Task</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
