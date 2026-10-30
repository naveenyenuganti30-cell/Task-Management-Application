import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, taskApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Clock,
  PlayCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Plus,
  Activity as ActivityIcon,
  CheckCircle2,
  Tag,
  Sparkles,
} from 'lucide-react';

export const DashboardPage = ({ onOpenNewTask }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, upcomingRes, activityRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getUpcoming(),
        dashboardApi.getActivity(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (upcomingRes.success) setUpcoming(upcomingRes.tasks || []);
      if (activityRes.success) setActivities(activityRes.activities || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      toast.error('Could not refresh dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickComplete = async (taskId) => {
    try {
      await taskApi.updateTask(taskId, { status: 'completed' });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
      toast.success('Task marked as completed!');
      fetchDashboardData();
    } catch (err) {
      toast.error('Could not update task status.');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const todayStr = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const getActivityIcon = (action) => {
    switch (action) {
      case 'created':
        return <Plus className="w-3.5 h-3.5 text-indigo-500" />;
      case 'status_changed':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case 'deleted':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <ActivityIcon className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const formatActivityTime = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Loading your workspace analytics...
        </p>
      </div>
    );
  }

  const completionRate = stats?.completionRate || 0;
  const highPriority = stats?.priorities?.high || 0;
  const mediumPriority = stats?.priorities?.medium || 0;
  const lowPriority = stats?.priorities?.low || 0;
  const totalPriorities = highPriority + mediumPriority + lowPriority || 1;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white overflow-hidden shadow-xl shadow-indigo-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-indigo-200 font-medium mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}! 👋
            </h1>
            <p className="text-sm text-indigo-100/80 mt-1 max-w-xl">
              You have{' '}
              <span className="font-bold text-white">
                {stats?.todo || 0} pending
              </span>{' '}
              and{' '}
              <span className="font-bold text-white">
                {stats?.inProgress || 0} in-progress
              </span>{' '}
              tasks. Let's make today productive!
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenNewTask}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm transition-all shadow-lg active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Task</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Tasks */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Tasks
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.total || 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">in your flow</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              In Progress
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.inProgress || 0}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 ml-2 font-medium">
              active now
            </span>
          </div>
        </div>

        {/* Completed */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats?.completed || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
              {completionRate}% rate
            </span>
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Overdue
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                stats?.overdue > 0
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span
              className={`text-3xl font-extrabold ${
                stats?.overdue > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {stats?.overdue || 0}
            </span>
            <span className="text-xs text-slate-400 ml-2">
              {stats?.overdue > 0 ? 'needs attention' : 'all caught up!'}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics & Priority Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Completion & Priority Analytics */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Productivity Overview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of your current workload and delivery speed
            </p>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Overall Completion Rate
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {completionRate}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, completionRate))}%` }}
                />
              </div>
            </div>

            {/* Priority Distribution Bar */}
            <div className="mt-6">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Tasks by Priority
              </span>
              <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <div
                  className="bg-rose-500"
                  style={{ width: `${(highPriority / totalPriorities) * 100}%` }}
                  title={`High: ${highPriority}`}
                />
                <div
                  className="bg-amber-400"
                  style={{ width: `${(mediumPriority / totalPriorities) * 100}%` }}
                  title={`Medium: ${mediumPriority}`}
                />
                <div
                  className="bg-emerald-500"
                  style={{ width: `${(lowPriority / totalPriorities) * 100}%` }}
                  title={`Low: ${lowPriority}`}
                />
              </div>

              {/* Priority Legend */}
              <div className="flex items-center justify-between mt-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>High: {highPriority}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Med: {mediumPriority}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Low: {lowPriority}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Pill List */}
          {stats?.categories && stats.categories.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Top Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stats.categories.map((c) => (
                  <span
                    key={c.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Tag className="w-3 h-3 opacity-60" />
                    <span>{c.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      ({c.count})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Upcoming Deadlines
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tasks scheduled for the next 7 days
                </p>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View all tasks</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {upcoming.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No upcoming deadlines due soon!
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  You are all set for the week.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcoming.map((task) => {
                  const due = new Date(task.dueDate);
                  return (
                    <div
                      key={task._id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 shadow-xs hover:border-indigo-400 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleQuickComplete(task._id)}
                          className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                          title="Mark complete"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {task.title}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {task.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                          <Calendar className="w-3 h-3" />
                          {due.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Recent Activity Audit Trail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live stream of task updates and changes
            </p>
          </div>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No activity recorded yet. Create or update tasks to see your workflow history!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {activities.slice(0, 4).map((act) => (
              <div
                key={act._id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                  {getActivityIcon(act.action)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {act.taskTitle}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                    {act.action.replace('_', ' ')}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {formatActivityTime(act.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
