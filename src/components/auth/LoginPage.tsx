import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Building2,
  Shield,
  GraduationCap,
  Users2,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginWithCredentials } = useApp();

  // Selected role for sub-form (null = 3-card role selection screen)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'cr' | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preset accounts per user specification
  const rolePresets = {
    admin: {
      title: 'Admin Login',
      badge: 'Exactly 1 Admin',
      description: 'Master administrative control over 5 section CRs, faculty roster, 20 classrooms, and bookings.',
      defaultEmail: 'kondareddy123@gmail.com',
      demoPass: '12345678',
      icon: <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      accentBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      borderHover: 'hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/20',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      btnColor: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    },
    faculty: {
      title: 'Faculty Login',
      badge: 'Shared Faculty Account',
      description: 'Book classrooms for extra lectures, view dynamically registered faculty profiles, and manage reservations.',
      defaultEmail: 'faculty456@gmail.com',
      demoPass: '87654321',
      icon: <GraduationCap className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderHover: 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    },
    cr: {
      title: 'CR Login',
      badge: 'Shared CR Account',
      description: 'Class Representatives for 5 official CSE Sections (Section A to E) to book and manage classroom slots.',
      defaultEmail: 'cr789@gmail.com',
      demoPass: '26233348',
      icon: <Users2 className="w-7 h-7 text-amber-600 dark:text-amber-400" />,
      accentBg: 'bg-amber-50 dark:bg-amber-950/60',
      borderHover: 'hover:border-amber-500 hover:ring-2 hover:ring-amber-500/20',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      btnColor: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
  };

  const handleSelectRole = (role: 'admin' | 'faculty' | 'cr') => {
    setSelectedRole(role);
    setEmail(rolePresets[role].defaultEmail);
    setPassword('');
    setErrorMessage(null);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setErrorMessage(null);
    setPassword('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithCredentials(email.trim(), password, selectedRole);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrefill = (role: 'admin' | 'faculty' | 'cr') => {
    setSelectedRole(role);
    setEmail(rolePresets[role].defaultEmail);
    setPassword(rolePresets[role].demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg mb-3">
          <Building2 className="w-7 h-7" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Smart Classroom Finder &amp; Booking
          </h1>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white tracking-wider">
            CSE DEPT
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Department of Computer Science &amp; Engineering · Left Wing (L-101..110) &amp; Right Wing (R-101..110)
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* STEP 1: Three Clearly Distinguishable Role Cards */}
        {selectedRole === null ? (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Your Role to Access Dashboard
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose your department role to proceed to the designated login portal
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Admin */}
              <div
                onClick={() => handleSelectRole('admin')}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition-all flex flex-col justify-between ${rolePresets.admin.borderHover} group`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${rolePresets.admin.accentBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    {rolePresets.admin.icon}
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${rolePresets.admin.badgeColor}`}>
                    {rolePresets.admin.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rolePresets.admin.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {rolePresets.admin.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Card 2: Faculty */}
              <div
                onClick={() => handleSelectRole('faculty')}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition-all flex flex-col justify-between ${rolePresets.faculty.borderHover} group`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${rolePresets.faculty.accentBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    {rolePresets.faculty.icon}
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${rolePresets.faculty.badgeColor}`}>
                    {rolePresets.faculty.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {rolePresets.faculty.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {rolePresets.faculty.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Card 3: CR */}
              <div
                onClick={() => handleSelectRole('cr')}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer transition-all flex flex-col justify-between ${rolePresets.cr.borderHover} group`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl ${rolePresets.cr.accentBg} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                    {rolePresets.cr.icon}
                  </div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-2 ${rolePresets.cr.badgeColor}`}>
                    {rolePresets.cr.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {rolePresets.cr.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {rolePresets.cr.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                  <span>Sign In as Section CR</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>

            {/* Quick Credentials Info / One-Click Test Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  <span>Designated Firebase Auth Credentials</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">India Standard Time (IST)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Admin prefill */}
                <button
                  type="button"
                  onClick={() => handleQuickPrefill('admin')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Admin</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold">
                      1 Admin
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                    kondareddy123@gmail.com
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Pass: 12345678</p>
                </button>

                {/* Faculty prefill */}
                <button
                  type="button"
                  onClick={() => handleQuickPrefill('faculty')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Faculty</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold">
                      Shared
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                    faculty456@gmail.com
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Pass: 87654321</p>
                </button>

                {/* CR prefill */}
                <button
                  type="button"
                  onClick={() => handleQuickPrefill('cr')}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-400 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400">5 CRs</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-semibold">
                      5 Secs
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-800 dark:text-slate-200 truncate">
                    cr789@gmail.com
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Pass: 26233348</p>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Click any credential to prefill and open its login form directly.
              </p>
            </div>
          </div>
        ) : (
          /* STEP 2: Dedicated Role Login Form */
          <div className="bg-white dark:bg-slate-900 py-8 px-6 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in duration-150">
            {/* Top Navigation: Back Button & Role Header */}
            <div>
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Role Selection</span>
              </button>

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${rolePresets[selectedRole].accentBg} flex items-center justify-center shrink-0 shadow-sm`}>
                  {rolePresets[selectedRole].icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {rolePresets[selectedRole].title}
                    </h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rolePresets[selectedRole].badgeColor}`}>
                      {rolePresets[selectedRole].badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sign in with registered credentials. Role verification enforced via Firestore rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{errorMessage}</p>
                  {errorMessage.includes('Access denied for this role') && (
                    <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                      The credentials entered belong to a different role. Please switch to the appropriate role login screen.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={rolePresets[selectedRole].defaultEmail}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${rolePresets[selectedRole].btnColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating &amp; Verifying Role...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to {rolePresets[selectedRole].title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Quick Fill for this form */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Preset: {rolePresets[selectedRole].defaultEmail}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(rolePresets[selectedRole].defaultEmail);
                    setPassword(rolePresets[selectedRole].demoPass);
                  }}
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Fill Credentials
                </button>
              </div>
            </form>

            {/* Security note */}
            <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Passwords handled exclusively via Firebase Auth. Stored roles locked in Firestore.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
