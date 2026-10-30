import confetti from 'canvas-confetti';
import {
  Calendar,
  Tag,
  Clock,
  CheckCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightCircle,
  AlertCircle,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  isKanban = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b'],
    });
  };

  const handleToggleCompleted = () => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    if (nextStatus === 'completed') {
      triggerConfetti();
    }
    onStatusChange(task._id, nextStatus);
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            High
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Low
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Medium
          </span>
        );
    }
  };

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

    const diffDays = Math.round((dueDay - today) / (1000 * 60 * 60 * 24));

    if (task.status === 'completed') {
      return {
        label: `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        isOverdue: false,
      };
    }

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d`,
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return { label: 'Due Today', isToday: true };
    }
    if (diffDays === 1) {
      return { label: 'Due Tomorrow', isUpcoming: true };
    }
    if (diffDays < 7) {
      return {
        label: `Due in ${diffDays}d`,
        isUpcoming: true,
      };
    }

    return {
      label: due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isUpcoming: false,
    };
  };

  const dueInfo = formatDueDate(task.dueDate);

  const getNextStatus = (current) => {
    if (current === 'todo') return { next: 'in_progress', label: 'Start Progress' };
    if (current === 'in_progress') return { next: 'completed', label: 'Complete Task' };
    return { next: 'todo', label: 'Reopen Task' };
  };

  const nextAction = getNextStatus(task.status);

  return (
    <div
      className={`group relative rounded-2xl p-4 sm:p-4.5 transition-all duration-200 glass-card hover:shadow-lg dark:hover:shadow-indigo-950/20 hover:-translate-y-0.5 ${
        task.status === 'completed'
          ? 'opacity-75 bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60'
          : 'border-slate-200 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Top row: Priority, Category, and Action Menu */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center flex-wrap gap-1.5">
          {getPriorityBadge(task.priority)}

          {task.category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Tag className="w-2.5 h-2.5 opacity-60" />
              {task.category}
            </span>
          )}
        </div>

        {/* Card Options Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Task options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-30 animate-in fade-in duration-100">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                Edit Task
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onStatusChange(task._id, nextAction.next);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
              >
                <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-500" />
                {nextAction.label}
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Title & Checkbox */}
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={handleToggleCompleted}
          className="mt-0.5 rounded-lg p-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer shrink-0"
          title={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
          aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark completed'}
        >
          {task.status === 'completed' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
          ) : (
            <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            onClick={() => onEdit(task)}
            className={`text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug line-clamp-2 ${
              task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h4>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Footer Info: Due Date & Status Pill */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        {/* Due Date */}
        {dueInfo ? (
          <div
            className={`flex items-center gap-1.5 font-medium ${
              dueInfo.isOverdue
                ? 'text-rose-600 dark:text-rose-400'
                : dueInfo.isToday
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {dueInfo.isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Calendar className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{dueInfo.label}</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-[11px]">No deadline</span>
        )}

        {/* 1-Click Status Advance */}
        <button
          type="button"
          onClick={() => onStatusChange(task._id, nextAction.next)}
          className="text-[11px] font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>{nextAction.label.split(' ')[0]}</span>
          <ArrowRightCircle className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
