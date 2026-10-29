import React, { useState } from 'react';
import { Booking } from '../../types';
import { AlertCircle, Calendar, Clock, MapPin, Users2, X } from 'lucide-react';
import { formatTime12h } from '../../utils/istTime';

interface CancelBookingModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (bookingId: string) => Promise<void>;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmCancel(booking.id);
      onClose();
    } catch (e) {
      console.error('Failed to cancel booking:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cancel-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
                Cancel Booking
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Are you sure you want to cancel this booking?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Cancelling this booking will immediately free the classroom for other faculty and CRs. This cannot be undone.
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Room Number:
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                {booking.roomNumber}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-indigo-500" /> Section:
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {booking.section}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date:
              </span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {booking.date}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Start &amp; End Time:
              </span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {booking.startTime} – {booking.endTime} ({formatTime12h(booking.startTime)} - {formatTime12h(booking.endTime)} IST)
              </span>
            </div>

            {booking.bookedByName && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Booked By:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {booking.bookedByName} ({booking.role.toUpperCase()})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer with the two required buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            No, Keep Booking
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
