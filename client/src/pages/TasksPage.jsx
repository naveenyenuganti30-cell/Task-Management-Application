import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { FilterBar } from '../components/FilterBar';
import { KanbanBoard } from '../components/KanbanBoard';
import { TaskListView } from '../components/TaskListView';
import { TaskModal } from '../components/TaskModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Plus, CheckSquare } from 'lucide-react';

export const TasksPage = ({ isCreateModalOpen, setIsCreateModalOpen }) => {
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'

  // Modal states
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [initialStatusForModal, setInitialStatusForModal] = useState('todo');

  // Load tasks from backend
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        dueDateFilter: dueDateFilter !== 'all' ? dueDateFilter : undefined,
        sortBy,
        order: sortOrder,
        limit: 150,
      };

      const res = await taskApi.getTasks(params);
      if (res.success) {
        setTasks(res.tasks || []);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Could not load tasks from server.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, categoryFilter, dueDateFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTasks]);

  // Unique categories list
  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean))
  );

  // Status change handler (Optimistic UI update)
  const handleStatusChange = async (taskId, newStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      toast.success(`Task moved to ${newStatus.replace('_', ' ')}!`, 2000);
    } catch (err) {
      // Revert on failure
      setTasks(previousTasks);
      toast.error('Failed to update task status.');
    }
  };

  // Create or Update task handler
  const handleSaveTask = async (taskPayload) => {
    if (taskToEdit) {
      const res = await taskApi.updateTask(taskToEdit._id, taskPayload);
      if (res.success) {
        toast.success('Task updated successfully!');
        setTasks((prev) =>
          prev.map((t) => (t._id === taskToEdit._id ? res.task : t))
        );
      }
    } else {
      const res = await taskApi.createTask(taskPayload);
      if (res.success) {
        toast.success('Task created successfully!');
        setTasks((prev) => [res.task, ...prev]);
        setTotalCount((c) => c + 1);
      }
    }
  };

  // Delete task handler
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);

    try {
      const res = await taskApi.deleteTask(taskToDelete._id);
      if (res.success) {
        toast.success('Task permanently removed.');
        setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
        setTotalCount((c) => Math.max(0, c - 1));
        setTaskToDelete(null);
      }
    } catch (err) {
      toast.error('Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick add button in Kanban column
  const handleQuickAdd = (status) => {
    setInitialStatusForModal(status);
    setTaskToEdit(null);
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Tasks & Workflow Board
            </h1>
            <span className="text-xs px-2.5 py-1 font-bold rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              {totalCount} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Drag and drop tasks across columns or switch to card grid view.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTaskToEdit(null);
            setInitialStatusForModal('todo');
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/25 active:scale-98 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and View Toolbar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        viewMode={viewMode}
        setViewMode={setViewMode}
        categories={categories}
        totalTasks={tasks.length}
      />

      {/* Content Area */}
      {loading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Filtering and fetching tasks...</p>
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onEditTask={handleEditClick}
          onDeleteTask={(task) => setTaskToDelete(task)}
          onStatusChange={handleStatusChange}
          onQuickAdd={handleQuickAdd}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          onEditTask={handleEditClick}
          onDeleteTask={(task) => setTaskToDelete(task)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Create / Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};
