import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { ProfilePage } from './pages/ProfilePage';
import { TaskModal } from './components/TaskModal';
import { taskApi } from './services/api';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const toast = useToast();
  const [globalTaskModalOpen, setGlobalTaskModalOpen] = useState(false);

  // Keyboard shortcut: Press 'c' to open Create Task modal anywhere when not in an input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'c' || e.key === 'C') &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
        !e.metaKey &&
        !e.ctrlKey &&
        isAuthenticated
      ) {
        e.preventDefault();
        setGlobalTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const handleGlobalCreateTask = async (taskPayload) => {
    try {
      await taskApi.createTask(taskPayload);
      toast.success('Task created successfully!');
      // Dispatch custom event so current page refreshes if needed
      window.dispatchEvent(new CustomEvent('taskflow_task_created'));
    } catch (err) {
      toast.error('Failed to create task.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium tracking-wider uppercase mt-4">
          Loading TaskFlow...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenNewTask={() => setGlobalTaskModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route
            path="/"
            element={<DashboardPage onOpenNewTask={() => setGlobalTaskModalOpen(true)} />}
          />
          <Route
            path="/tasks"
            element={
              <TasksPage
                isCreateModalOpen={globalTaskModalOpen}
                setIsCreateModalOpen={setGlobalTaskModalOpen}
              />
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Quick Task Creation Modal */}
      <TaskModal
        isOpen={globalTaskModalOpen}
        onClose={() => setGlobalTaskModalOpen(false)}
        onSave={handleGlobalCreateTask}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
