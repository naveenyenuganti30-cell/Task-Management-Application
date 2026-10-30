import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Kanban,
  Zap,
} from 'lucide-react';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, confirmPassword });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant 1-click demo login for fast reviewing
  const handleDemoLogin = async () => {
    setIsSubmitting(true);
    const demoEmail = 'alex.dev@taskflow.demo';
    const demoPass = 'TaskFlow2026!';

    // Attempt login; if demo user doesn't exist yet in fresh memory DB, auto-register!
    const loginResult = await login(demoEmail, demoPass);
    if (!loginResult.success) {
      await register({
        name: 'Alex Johnson',
        email: demoEmail,
        password: demoPass,
        confirmPassword: demoPass,
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-5xl rounded-3xl glass-panel shadow-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Side: Brand & Visual Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Glow Bubbles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white block">
                  TaskFlow
                </span>
                <span className="text-xs uppercase tracking-widest text-indigo-200 font-semibold">
                  Productivity System
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight mt-4 text-white">
              Organize your work with speed, clarity, and focus.
            </h1>
            <p className="mt-3 text-sm text-indigo-100/80 leading-relaxed">
              Real-time Kanban boards, smart priority routing, deadline intelligence, and productivity analytics designed for high-performing teams.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 my-8 space-y-3">
            {[
              { icon: Kanban, title: 'Interactive Kanban Boards', desc: 'Drag-and-drop workflow statuses' },
              { icon: Zap, title: 'Instant Analytics', desc: 'Real-time completion metrics and overdue alerts' },
              { icon: CheckCircle2, title: 'Zero Friction', desc: 'Auto fallback database with instant cloud sync' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10"
                >
                  <div className="p-2 rounded-xl bg-white/20 text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{f.title}</h4>
                    <p className="text-[11px] text-indigo-200/90">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Demo User CTA Badge */}
          <div className="relative z-10 pt-4 border-t border-white/15">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-indigo-600" />
              <span>1-Click Test Drive (Demo Account)</span>
            </button>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-md w-full mx-auto">
            {/* Tab Switcher */}
            <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-8">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isLogin
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  !isLogin
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isLogin
                  ? 'Enter your credentials to access your task dashboard.'
                  : 'Start organizing your workflow with TaskFlow today.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name for Registration */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password for Registration */}
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/25 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to TaskFlow' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
