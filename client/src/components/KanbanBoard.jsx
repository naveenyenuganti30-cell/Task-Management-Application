import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Clock, PlayCircle, CheckCircle2, Plus } from 'lucide-react';

export const KanbanBoard = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onQuickAdd,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      icon: Clock,
      headerBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40',
      countBg: 'bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      icon: PlayCircle,
      headerBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40',
      countBg: 'bg-amber-200/60 dark:bg-amber-900 text-amber-800 dark:text-amber-200',
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: CheckCircle2,
      headerBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40',
      countBg: 'bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200',
    },
  ];

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
    setDraggedTaskId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const Icon = col.icon;
        const columnTasks = tasks.filter((t) => t.status === col.id);
        const isHovered = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-3xl p-4 transition-all duration-200 min-h-[500px] border ${
              isHovered
                ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-500 scale-[1.01]'
                : 'glass-panel border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${col.headerBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {col.title}
                </h3>
                <span className={`text-xs px-2 py-0.5 font-bold rounded-full ${col.countBg}`}>
                  {columnTasks.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onQuickAdd(col.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Add task to ${col.title}`}
                aria-label={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task Cards Container */}
            <div className="flex-1 flex flex-col gap-3.5">
              {columnTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                    No tasks in {col.title.toLowerCase()}
                  </p>
                  <button
                    type="button"
                    onClick={() => onQuickAdd(col.id)}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add a task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <TaskCard
                      task={task}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                      isKanban={true}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
