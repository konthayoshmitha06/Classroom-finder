import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WingVisualPlan } from '../classroom/WingVisualPlan';
import {
  Building,
  Calendar,
  Bell,
  GraduationCap,
  Users2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, notifications, classrooms } = useApp();
  const [activeTab, setActiveTab] = useState<'availability' | 'notifications'>('availability');

  const studentSection = currentUser?.section || 'Section A';

  // Class notifications
  const myNotifications = notifications.filter(
    (n) =>
      (n.recipientUserIds && (n.recipientUserIds.includes(currentUser?.id || '') || n.recipientUserIds.includes('all'))) ||
      n.section === studentSection ||
      n.targetRole === 'all'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Student Profile & Class Overview Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {currentUser?.name.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Welcome, {currentUser?.name}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Student Portal · View Only
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Department: <strong className="text-slate-700 dark:text-slate-300">Computer Science &amp; Engineering</strong> · Section: <strong>{studentSection}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Class Section</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Users2 className="w-3.5 h-3.5 text-indigo-500" />
                {studentSection}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-slate-400 block">Rooms Catalog</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                20 Classrooms (2 Wings)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-1 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('availability')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'availability'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>CSE Wing Floor Plan ({classrooms.length} Rooms)</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Class Venue &amp; Booking Alerts</span>
          {myNotifications.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-mono">
              {myNotifications.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: AVAILABILITY FLOOR PLAN */}
      {activeTab === 'availability' && <WingVisualPlan />}

      {/* TAB 2: NOTIFICATIONS RECEIVED */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Booking Updates &amp; Venue Alerts for {studentSection}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatic in-app notifications generated whenever faculty or your Class Representative reserves or cancels a classroom.
            </p>
          </div>

          <div className="space-y-3">
            {myNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No notifications on file for your class.</p>
            ) : (
              myNotifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {n.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {n.bookingTime || n.createdAt.split('T')[0]}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>
                      Room:{' '}
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{n.roomNumber}</strong>
                    </span>
                    <span>
                      Booked by: <strong>{n.bookedByName}</strong> ({n.bookedByRole})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
