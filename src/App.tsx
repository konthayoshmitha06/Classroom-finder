import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { CRDashboard } from './components/cr/CRDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, toasts, removeToast } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // If not logged in, show clean Login Page (3-Card Selection)
  if (!currentUser) {
    return <LoginPage />;
  }

  // Automatic Role Detection and Dashboard Routing (Strict RBAC)
  const renderRoleDashboard = () => {
    switch (currentUser.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'faculty':
        return <FacultyDashboard />;
      case 'cr':
        return <CRDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <FacultyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Main App Navigation Header with Logout */}
      <Header onOpenNotifications={() => setIsNotifOpen(true)} />

      {/* Role-Specific Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {renderRoleDashboard()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>CampusRoom</strong> · Smart Classroom Availability &amp; Booking System (CSE Department)
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Operating Hours: 08:00 AM – 06:00 PM IST</span>
            <span>·</span>
            <span>Protected RBAC (Firestore + Auth)</span>
          </div>
        </div>
      </footer>

      {/* In-App Notifications Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Toast Alerts Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg text-xs font-medium flex items-center justify-between gap-3 transition-all ${
              t.type === 'success'
                ? 'bg-emerald-900/90 border-emerald-700 text-white'
                : t.type === 'error'
                ? 'bg-rose-900/90 border-rose-700 text-white'
                : t.type === 'warning'
                ? 'bg-amber-900/90 border-amber-700 text-white'
                : 'bg-slate-900/90 border-slate-700 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : t.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
