import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { WingVisualPlan } from '../classroom/WingVisualPlan';
import { SearchAndBookModal } from '../booking/SearchAndBookModal';
import { CancelBookingModal } from '../common/CancelBookingModal';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Plus,
  BookOpen,
  CheckCircle2,
  UserCheck,
  Building,
} from 'lucide-react';
import { formatTime12h } from '../../utils/istTime';

export const FacultyDashboard: React.FC = () => {
  const {
    currentUser,
    bookings,
    cancelBooking,
    facultyList,
    selectedPersonId,
    selectedPersonName,
    setSelectedPerson,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'availability' | 'faculty-cards' | 'my-bookings'>('availability');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [prefilledRoomNumber, setPrefilledRoomNumber] = useState<string | undefined>(undefined);

  // Cancellation Modal state
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Current active faculty profile
  const activeFaculty = facultyList.find((f) => f.id === selectedPersonId) || facultyList[0];

  // Filter ONLY this faculty's own bookings matching their personId
  const myBookings = bookings.filter(
    (b) => b.role === 'faculty' && (b.personId === (activeFaculty?.id || selectedPersonId) || b.bookedBy === currentUser?.id)
  );

  const handleOpenCancel = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleFacultySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = facultyList.find((f) => f.id === e.target.value);
    if (selected) {
      setSelectedPerson(selected.id, selected.name);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Faculty Profile Hero Header with "Booking as:" selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Faculty Portal
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                CSE FACULTY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department of Computer Science &amp; Engineering · Extra Class Scheduling &amp; Availability
            </p>
          </div>
        </div>

        {/* Persona Selector ("Booking as: ...") and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
            <div className="flex flex-col">
              <label htmlFor="faculty-select" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Booking as:
              </label>
              <select
                id="faculty-select"
                value={activeFaculty?.id || selectedPersonId}
                onChange={handleFacultySelectChange}
                className="bg-transparent font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {facultyList.map((fac) => (
                  <option key={fac.id} value={fac.id} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                    {fac.name} ({fac.section} · {fac.subject})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setPrefilledRoomNumber(undefined);
              setIsBookModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Room for Extra Class</span>
          </button>
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
          onClick={() => setActiveTab('faculty-cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'faculty-cards'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Registered Faculty ({facultyList.length})</span>
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
            My Bookings ({myBookings.filter((b) => b.status === 'Confirmed').length} Active)
          </span>
        </button>
      </div>

      {/* TAB 1: Live Availability Floor Plan */}
      {activeTab === 'availability' && (
        <WingVisualPlan
          onSelectRoomForBooking={(roomNumber) => {
            setPrefilledRoomNumber(roomNumber);
            setIsBookModalOpen(true);
          }}
        />
      )}

      {/* TAB 2: Dynamic Card Listing of ALL Registered Faculty (Name, Subject, Section) */}
      {activeTab === 'faculty-cards' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Registered Faculty Roster</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Firestore Synced
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All registered CSE faculty members loaded dynamically from Firestore database.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Total: {facultyList.length} Faculty
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facultyList.map((fac) => {
              const isCurrentActive = fac.id === activeFaculty?.id;

              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedPerson(fac.id, fac.name)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrentActive
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {fac.name.split(' ').slice(-1)[0]?.charAt(0) || 'F'}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {fac.section}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{fac.name}</span>
                      {isCurrentActive && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </h4>

                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="font-medium truncate">{fac.subject}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                        <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Section: {fac.section}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate">{fac.email}</span>
                    {isCurrentActive ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Active Persona
                      </span>
                    ) : (
                      <span className="text-slate-400 hover:text-emerald-600">
                        Select to Book →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: My Bookings with Cancel Booking button */}
      {activeTab === 'my-bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bookings for {activeFaculty?.name || 'Faculty Member'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View your scheduled extra classes and reservations. Cancel any slot to immediately free the room.
              </p>
            </div>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Room</span>
            </button>
          </div>

          {myBookings.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No active bookings recorded for {activeFaculty?.name}.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                You can book any of the 20 CSE classrooms for an extra lecture or academic session.
              </p>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="mt-3 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
              >
                Schedule Extra Class Now
              </button>
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
                            Purpose: <strong className="capitalize">{b.purpose || 'Extra Class'}</strong> · Faculty: <strong>{b.personName || activeFaculty?.name}</strong>
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

                      {/* Details Box: Room, Section, Date, Start, End Time */}
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
                            {b.startTime} - {b.endTime} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)} IST)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explicit Cancel Booking Button */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Saved in Firestore
                      </span>

                      {isConfirmed ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCancel(b)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors cursor-pointer"
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
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
        initialPurpose="extra class"
        initialSection={activeFaculty?.section}
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
