import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Check, Info } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notifications &amp; Alerts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span>No notifications at this time.</span>
            </div>
          ) : (
            notifications.map((n) => {
              const isRead = n.isRead ?? false;

              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    isRead
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                      {n.title}
                    </h4>
                    {!isRead && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 shrink-0 cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                    {n.message}
                  </p>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800 pt-1.5 font-mono">
                    <span>{n.roomNumber ? `Room: ${n.roomNumber}` : 'General'}</span>
                    <span>{n.bookingTime || n.createdAt?.split('T')[0]}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
