import { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const CATEGORY_PRESETS = ['Work', 'Personal', 'Development', 'Design', 'Urgent', 'Research'];

export const TaskModal = ({ isOpen, onClose, onSave, taskToEdit = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing or resetting on open
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');

      if (CATEGORY_PRESETS.includes(taskToEdit.category)) {
        setCategory(taskToEdit.category);
        setCustomCategory('');
      } else if (taskToEdit.category) {
        setCategory('custom');
        setCustomCategory(taskToEdit.category);
      } else {
        setCategory('Work');
      }

      if (taskToEdit.dueDate) {
        // Format to YYYY-MM-DD for date input
        const d = new Date(taskToEdit.dueDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setCategory('Work');
      setCustomCategory('');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickDate = (daysFromNow) => {
    const target = new Date();
    target.setDate(target.getDate() + daysFromNow);
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const selectedCategory = category === 'custom' ? customCategory.trim() || 'General' : category;

    setIsSubmitting(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      category: selectedCategory,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="task-modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {taskToEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {taskToEdit ? 'Update details, deadline, and priority.' : 'Define your task goals, deadlines, and milestones.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="task-title" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/140</span>
            </div>
            <input
              id="task-title"
              type="text"
              required
              maxLength={140}
              placeholder="e.g. Redesign navigation bar and review responsive styles"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="task-desc" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Description (Optional)
              </label>
              <span className="text-[11px] text-slate-400">{description.length}/2000</span>
            </div>
            <textarea
              id="task-desc"
              rows={3}
              maxLength={2000}
              placeholder="Add acceptance criteria, references, links, or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm resize-y transition-all"
            />
          </div>

          {/* Priority & Status Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Low', color: 'hover:border-emerald-500 text-emerald-600 dark:text-emerald-400', active: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500' },
                  { id: 'medium', label: 'Medium', color: 'hover:border-amber-500 text-amber-600 dark:text-amber-400', active: 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500' },
                  { id: 'high', label: 'High', color: 'hover:border-rose-500 text-rose-600 dark:text-rose-400', active: 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPriority(item.id)}
                    className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                      priority === item.id
                        ? item.active
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'todo', label: 'To Do', icon: Clock },
                  { id: 'in_progress', label: 'Doing', icon: Calendar },
                  { id: 'completed', label: 'Done', icon: CheckCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStatus(item.id)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        status === item.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CATEGORY_PRESETS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Tag className="w-3 h-3 inline mr-1 opacity-70" />
                  {cat}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCategory('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  category === 'custom'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                + Custom Tag
              </button>
            </div>

            {category === 'custom' && (
              <input
                type="text"
                placeholder="Type custom category name..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                maxLength={40}
                className="w-full mt-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Due Date & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="task-duedate" className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Deadline / Due Date
              </label>
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate('')}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Clear Date
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                id="task-duedate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickDate(0)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(1)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDate(7)}
                  className="px-2.5 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
                >
                  In 1 Week
                </button>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 shadow-md shadow-indigo-600/25 transition-all duration-150 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
