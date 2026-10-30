import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Save,
  X,
} from 'lucide-react';

export interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  completedAt?: string | null;
  ownerName?: string;
  ownerEmail?: string;
}

interface TaskCardProps {
  task: TaskItem;
  onStatusChange: (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  onUpdate: (taskId: string, updatedData: Partial<TaskItem>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const isCompleted = task.status === 'Completed';

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onUpdate(task._id, {
      title: editTitle.trim(),
      description: editDesc.trim(),
      priority: editPriority,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditPriority(task.priority);
    setIsEditing(false);
  };

  const priorityStyles = {
    Low: 'text-[#463353] bg-[#F0E5F8] border-[#E9D5EF]',
    Medium: 'text-[#7041A5] bg-[#FFF2F8] border-[#F2CBE2]',
    High: 'text-[#B34D91] bg-rose-50 border-rose-200',
  };

  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-4 relative ${
        isCompleted
          ? 'bg-white/60 border-emerald-100 shadow-2xs'
          : 'bg-white border-[#E9D5EF] shadow-xs hover:shadow-md'
      }`}
    >
      {/* Top Meta: Priority & Status Action */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            priorityStyles[task.priority] || priorityStyles.Medium
          }`}
        >
          {task.priority} Priority
        </span>

        <div className="flex items-center gap-1">
          {/* Quick status stepper buttons */}
          {task.status === 'Pending' && (
            <button
              onClick={() => onStatusChange(task._id, 'In Progress')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7041A5] hover:text-[#5d338e] bg-[#F0E5F8] hover:bg-[#e4d4f2] px-2 py-1 rounded-lg transition-colors"
              title="Move to In Progress"
            >
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'In Progress' && (
            <>
              <button
                onClick={() => onStatusChange(task._id, 'Pending')}
                className="p-1 text-[#987BAA] hover:text-[#463353] hover:bg-[#F8F3FC] rounded-lg transition-colors"
                title="Move back to Pending"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onStatusChange(task._id, 'Completed')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors border border-emerald-200"
                title="Mark as Completed"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Complete</span>
              </button>
            </>
          )}

          {task.status === 'Completed' && (
            <button
              onClick={() => onStatusChange(task._id, 'In Progress')}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#987BAA] hover:text-[#7041A5] bg-[#F8F3FC] hover:bg-[#F0E5F8] px-2 py-1 rounded-lg transition-colors"
              title="Reopen task"
            >
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <div className="space-y-2 mt-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm font-semibold rounded-lg border border-[#7041A5] bg-white text-[#38234C] focus:outline-hidden"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            rows={2}
            placeholder="Description..."
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#E9D5EF] bg-white text-[#463353] focus:outline-hidden"
          />
          <div className="flex items-center justify-between pt-1">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as any)}
              className="text-xs px-2 py-1 rounded-md border border-[#E9D5EF] text-[#463353]"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCancel}
                className="p-1.5 text-[#987BAA] hover:text-[#463353] rounded-md hover:bg-[#F8F3FC]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#7041A5] text-white text-xs font-semibold hover:bg-[#5d338e]"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h3
            className={`text-sm font-bold tracking-tight mb-1 break-words ${
              isCompleted
                ? 'line-through text-[#987BAA]'
                : 'text-[#38234C]'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-xs leading-relaxed mb-3 whitespace-pre-line break-words ${
                isCompleted ? 'text-[#987BAA]/70 line-through' : 'text-[#463353]'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Footer Info: Date & Edit/Delete Affordances */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F0E5F8] text-[11px] text-[#987BAA]">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formattedDate}</span>
              {isCompleted && task.completedAt && (
                <>
                  <span className="text-[#E9D5EF]">·</span>
                  <span className="text-emerald-700 font-medium">Done</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded text-[#987BAA] hover:text-[#7041A5] hover:bg-[#FFF2F8] transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                    onDelete(task._id);
                  }
                }}
                className="p-1 rounded text-[#987BAA] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
