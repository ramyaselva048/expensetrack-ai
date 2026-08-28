import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  MapPin, 
  Coins, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';

export const AuthPage: React.FC = () => {
  const { login, signup, loginAsDemo } = useAuth();
  const { showToast } = useExpenses();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('Finance Manager');

  // Form error state
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Basic Validation
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid business email address.');
      return;
    }

    if (!password || password.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (isLoginMode) {
        const result = login(email, password);
        if (!result.success) {
          setAuthError(result.message || 'Invalid email or password.');
          setIsLoading(false);
        } else {
          showToast('Welcome back!', 'Signed into ExpenseTrack Enterprise.', 'success');
        }
      } else {
        if (!name.trim()) {
          setAuthError('Please enter your full name.');
          setIsLoading(false);
          return;
        }

        const result = signup({
          name,
          email,
          password,
          role,
          companyName: companyName.trim() || 'My Enterprise',
        });

        if (!result.success) {
          setAuthError(result.message || 'Registration failed.');
          setIsLoading(false);
        } else {
          showToast('Account Created!', 'Your enterprise workspace is ready.', 'success');
        }
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsDemo();
      showToast('Demo Access Granted', 'Logged in as Alex Sterling (Chief Financial Officer).', 'success');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Side: Product Showcase & FinTech Highlights */}
        <div className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-slate-950 font-bold">
              <Sparkles className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-white">Expense<span className="text-emerald-400">Track</span></span>
              <p className="text-xs text-slate-400 font-medium">Enterprise Multi-Location FinTech Suite</p>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight leading-snug">
            Real-Time Expense Intelligence for Growing Teams
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            Eliminate spreadsheets and manual receipts. Track multi-city operational burn rate across Chennai, Bangalore, Coimbatore, Madurai, and custom regional hubs with instant audit-ready reports.
          </p>

          {/* Value Prop Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Multi-Location Branch Reconciliations</h4>
                <p className="text-[11px] text-slate-400">Compare regional spending velocities and allocate branch-level budgets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Automated Category Analytics & Budget Caps</h4>
                <p className="text-[11px] text-slate-400">Interactive charts, tax-deductible tracking, and one-click CSV/PDF exports.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Role-Based Security
            </span>
            <span className="flex items-center gap-1.5 text-blue-400">
              <Coins className="w-4 h-4" /> Multi-Currency Ready
            </span>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Header / Mode Switcher Tabs */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isLoginMode ? 'Sign In to Workspace' : 'Create Organization Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isLoginMode 
                    ? 'Enter your credentials or use the 1-click demo account.'
                    : 'Set up your finance manager profile in seconds.'}
                </p>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  id="tab-login-mode"
                  onClick={() => {
                    setIsLoginMode(true);
                    setAuthError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isLoginMode 
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  id="tab-signup-mode"
                  onClick={() => {
                    setIsLoginMode(false);
                    setAuthError(null);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    !isLoginMode 
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  ⚡
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">1-Click Executive Demo Login</p>
                  <p className="text-[11px] text-slate-400">
                    Preloaded with Chennai, Bangalore, Coimbatore & Madurai records
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLoginMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex.sterling@expensetrack.io');
                      setPassword('demo');
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
                    title="Fill Demo Credentials"
                  >
                    Autofill
                  </button>
                )}
                <button
                  id="btn-quick-demo-login"
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
                >
                  Instant Access
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="signup-name"
                        type="text"
                        placeholder="e.g. Priya Sundaram"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          id="signup-company"
                          type="text"
                          placeholder="e.g. Tamil Tech Ltd"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Role
                      </label>
                      <select
                        id="signup-role"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white focus:outline-none transition-all cursor-pointer"
                      >
                        <option value="Finance Manager">Finance Manager</option>
                        <option value="Chief Financial Officer">CFO / Executive</option>
                        <option value="Operations Lead">Operations Lead</option>
                        <option value="Department Auditor">Auditor</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Business Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  {isLoginMode && (
                    <button
                      type="button"
                      onClick={() => showToast('Password Reset', 'A reset link has been simulated for this demo.', 'info')}
                      className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-slate-950/80 border border-slate-800 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-auth-submit"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLoginMode ? 'Sign In to Dashboard' : 'Complete Setup & Launch'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                {isLoginMode ? "Don't have an account yet?" : 'Already registered?'}
                <button
                  id="btn-toggle-auth-mode"
                  type="button"
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setAuthError(null);
                  }}
                  className="ml-1.5 font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  {isLoginMode ? 'Create One Free' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
