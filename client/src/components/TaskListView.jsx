import { TaskCard } from './TaskCard';
import { Layers } from 'lucide-react';

export const TaskListView = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-3xl glass-panel text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          No tasks found
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          No tasks match your current search or filter criteria. Try adjusting your filters or create a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onStatusChange={onStatusChange}
          isKanban={false}
        />
      ))}
    </div>
  );
};
