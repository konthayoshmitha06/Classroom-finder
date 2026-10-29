import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { WingVisualPlan } from '../classroom/WingVisualPlan';
import { SearchAndBookModal } from '../booking/SearchAndBookModal';
import { CancelBookingModal } from '../common/CancelBookingModal';
import {
  Users2,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Plus,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { formatTime12h } from '../../utils/istTime';

export const CRDashboard: React.FC = () => {
  const {
    currentUser,
    bookings,
    cancelBooking,
    crs,
    addToast,
    selectedPersonId,
    selectedPersonName,
    setSelectedPerson,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'availability' | 'cr-cards' | 'my-bookings'>('availability');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [prefilledRoomNumber, setPrefilledRoomNumber] = useState<string | undefined>(undefined);

  // Cancellation Modal state
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Active CR profile
  const activeCR = crs.find((c) => c.id === selectedPersonId) || crs[0];
  const assignedSection = activeCR?.section || 'Section A';
  const canBook = activeCR ? activeCR.canBook : (currentUser?.canBook ?? true);

  // Filter ONLY this CR's own bookings matching personId
  const myBookings = bookings.filter(
    (b) => b.role === 'cr' && (b.personId === (activeCR?.id || selectedPersonId) || b.bookedBy === currentUser?.id)
  );

  const handleOpenCancel = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleCRSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = crs.find((c) => c.id === e.target.value);
    if (selected) {
      setSelectedPerson(selected.id, selected.name);
    }
  };

  const handleShareAnnouncement = (booking: Booking) => {
    const text = `📢 *Classroom Announcement: ${booking.section}*\nRoom: *${booking.roomNumber}*\nDate: ${booking.date}\nTime: ${booking.startTime} - ${booking.endTime} IST (${formatTime12h(booking.startTime)} - ${formatTime12h(booking.endTime)})\nPurpose: ${booking.purpose || 'Session'}\nBooked by CR: ${activeCR?.name || currentUser?.name}`;
    navigator.clipboard.writeText(text);
    addToast('Classroom notice copied to clipboard! Ready to share in class groups.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* CR Hero Banner with Persona Selector ("Booking as: ...") */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Users2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Class Representative Portal
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                CR · {assignedSection}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department of Computer Science &amp; Engineering · Section Classroom Coordination
            </p>
          </div>
        </div>

        {/* Persona Selector ("Booking as: ...") and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 ml-1" />
            <div className="flex flex-col">
              <label htmlFor="cr-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Booking as:
              </label>
              <select
                id="cr-select"
                value={activeCR?.id || selectedPersonId}
                onChange={handleCRSelectChange}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {crs.map((c) => (
                  <option key={c.id} value={c.id} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                    {c.name} ({c.section})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {canBook ? (
            <button
              onClick={() => {
                setPrefilledRoomNumber(undefined);
                setIsBookModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Room for {assignedSection}</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Booking Access Paused</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('availability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'availability'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Live Classroom Availability (20 Rooms)</span>
        </button>

        <button
          onClick={() => setActiveTab('cr-cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'cr-cards'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Section CRs (5 Sections)</span>
        </button>

        <button
          onClick={() => setActiveTab('my-bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'my-bookings'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>
            Bookings for {assignedSection} ({myBookings.filter((b) => b.status === 'Confirmed').length} Active)
          </span>
        </button>
      </div>

      {/* TAB 1: Live Availability */}
      {activeTab === 'availability' && (
        <WingVisualPlan
          onSelectRoomForBooking={(roomNumber) => {
            if (!canBook) {
              addToast('Your CR booking authorization is currently paused by Admin.', 'warning');
              return;
            }
            setPrefilledRoomNumber(roomNumber);
            setIsBookModalOpen(true);
          }}
        />
      )}

      {/* TAB 2: Dynamic Card Listing of ALL 5 Registered CRs (Name, Section) */}
      {activeTab === 'cr-cards' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Class Representatives (CRs)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Exactly 5 Sections
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All 5 official section CRs loaded dynamically from Firestore database.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {crs.length} / 5 CRs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crs.map((c) => {
              const isCurrentActive = c.id === activeCR?.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedPerson(c.id, c.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentActive
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                        {c.section}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.canBook
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {c.canBook ? 'Can Book' : 'Paused'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-2">
                      <span>{c.name}</span>
                      {isCurrentActive && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      )}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Assigned Section: <strong>{c.section}</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {c.email}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Department: CSE</span>
                    {isCurrentActive ? (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Active Persona
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-amber-600">
                        Select CR →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: My Class Bookings with Cancel Booking button */}
      {activeTab === 'my-bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bookings for {assignedSection}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cancel your reservations at any time to free up rooms for other peers and professors.
              </p>
            </div>
            {canBook && (
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Room</span>
              </button>
            )}
          </div>

          {myBookings.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No active bookings recorded for {assignedSection}.
              </p>
              {canBook && (
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                >
                  Book a Classroom for {assignedSection}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myBookings.map((b) => {
                const isConfirmed = b.status === 'Confirmed';

                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isConfirmed
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      {/* Booking Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                              {b.roomNumber}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              {b.section}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Purpose: <strong className="capitalize">{b.purpose || 'Class session'}</strong> · CR: <strong>{b.personName || activeCR?.name}</strong>
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      {/* Display Room, Section, Date, Start & End Time */}
                      <div className="bg-white dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date (IST):
                          </span>
                          <span className="font-mono font-semibold text-slate-900 dark:text-white">
                            {b.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Time Range:
                          </span>
                          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {b.startTime} - {b.endTime} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: WhatsApp share & Cancel Booking */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      {isConfirmed && (
                        <button
                          type="button"
                          onClick={() => handleShareAnnouncement(b)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Share Notice</span>
                        </button>
                      )}

                      {isConfirmed ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCancel(b)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors cursor-pointer ml-auto"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium ml-auto">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      <SearchAndBookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setPrefilledRoomNumber(undefined);
        }}
        initialRoomNumber={prefilledRoomNumber}
        initialSection={assignedSection}
      />

      {/* Cancel Confirmation Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        booking={bookingToCancel}
        onClose={() => {
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        onConfirmCancel={async (bookingId) => {
          await cancelBooking(bookingId);
        }}
      />
    </div>
  );
};
