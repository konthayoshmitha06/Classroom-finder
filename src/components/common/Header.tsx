import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Clock,
  Bell,
  LogOut,
  Shield,
  GraduationCap,
  Users2,
  User,
} from 'lucide-react';
import { formatISTDisplay } from '../../utils/istTime';

interface HeaderProps {
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications }) => {
  const { currentUser, logout, unreadNotifsCount, istNow } = useApp();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: <Shield className="w-3 h-3" />,
          label: 'ADMIN',
        };
      case 'faculty':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: <GraduationCap className="w-3 h-3" />,
          label: 'FACULTY',
        };
      case 'cr':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: <Users2 className="w-3 h-3" />,
          label: 'CR',
        };
      default:
        return {
          bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: <User className="w-3 h-3" />,
          label: 'STUDENT',
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-xs">
            CR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                CampusRoom
              </span>
              <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                CSE Dept
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:block">
              Left Wing (L-101..110) &amp; Right Wing (R-101..110)
            </p>
          </div>
        </div>

        {/* Right side: Live IST Clock, Notifications, User details, Logout */}
        <div className="flex items-center gap-3">
          {/* Real-time IST Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-[11px] font-mono">{formatISTDisplay(istNow)} IST</span>
          </div>

          {/* Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
            )}
          </button>

          {/* User Profile & Role */}
          {currentUser && (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {currentUser.section || currentUser.department}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badge.bg}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </span>

              {/* Logout button */}
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors cursor-pointer"
                title="End session and return to role selection"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
