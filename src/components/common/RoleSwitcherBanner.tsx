import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, GraduationCap, Users, AlertCircle, BookOpen } from 'lucide-react';

export const RoleSwitcherBanner: React.FC = () => {
  const { currentUser, users, switchUser, crs } = useApp();

  if (!currentUser) return null;

  // Group sample profiles for quick switching
  const adminUser = users.find((u) => u.role === 'admin');
  const facultyUser = users.find((u) => u.role === 'faculty');
  const crUser = users.find((u) => u.role === 'cr');
  const studentUser = users.find((u) => u.role === 'student');

  const crRecord = crs.find((c) => c.userId === currentUser.id || c.name === currentUser.name);

  return (
    <section aria-label="Role Switcher" className="bg-slate-900 border-b border-slate-800 text-slate-300 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide uppercase text-[10px] bg-slate-800 px-2 py-0.5 rounded">
            Role Switcher
          </span>
          <span className="hidden sm:inline text-slate-400">
            Current: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
          </span>
          {currentUser.role === 'cr' && crRecord && !crRecord.canBook && (
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium ml-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Booking Paused
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {adminUser && (
            <button
              onClick={() => switchUser(adminUser)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser.id === adminUser.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Full system administration, 5 CRs & Faculty management"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
              <span>Admin (1 Only)</span>
            </button>
          )}

          {facultyUser && (
            <button
              onClick={() => switchUser(facultyUser)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser.id === facultyUser.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Book, view, and cancel faculty reservations"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
              <span>Faculty</span>
            </button>
          )}

          {crUser && (
            <button
              onClick={() => switchUser(crUser)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser.id === crUser.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Class Representative for assigned section"
            >
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Section CR</span>
            </button>
          )}

          {studentUser && (
            <button
              onClick={() => switchUser(studentUser)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentUser.id === studentUser.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="View-only room availability & alerts"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-300" />
              <span>Student</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
