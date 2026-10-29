import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Classroom, WingType } from '../../types';
import { OFFICIAL_SECTIONS } from '../../data/seedData';
import {
  X,
  Calendar,
  Clock,
  Users2,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Building,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  getISTDateString,
  getISTTimeString,
  isTimeInPastIST,
  checkBookingOverlap,
  formatTime12h,
} from '../../utils/istTime';

interface SearchAndBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoomNumber?: string;
  initialPurpose?: string;
  initialSection?: string;
}

export const SearchAndBookModal: React.FC<SearchAndBookModalProps> = ({
  isOpen,
  onClose,
  initialRoomNumber,
  initialPurpose,
  initialSection: propSection,
}) => {
  const { currentUser, rawClassrooms, bookings, createBooking, crs, selectedPersonId, selectedPersonName } = useApp();

  // Flexible Date & Time Inputs (Strictly IST)
  const [date, setDate] = useState<string>(() => getISTDateString());
  const [startTime, setStartTime] = useState<string>('10:00');
  const [endTime, setEndTime] = useState<string>('11:30');

  // CR section lock or Faculty section picker
  const initialSection = useMemo(() => {
    if (propSection) return propSection;
    if (currentUser?.role === 'cr') {
      const crRecord = crs.find((c) => c.id === selectedPersonId || c.userId === currentUser.id || c.name === currentUser.name);
      return crRecord?.section || currentUser.section || OFFICIAL_SECTIONS[0];
    }
    return currentUser?.section || OFFICIAL_SECTIONS[0];
  }, [propSection, currentUser, crs, selectedPersonId]);

  const [section, setSection] = useState<string>(initialSection);
  const [studentCount, setStudentCount] = useState<number>(55);
  const [requiresProjector, setRequiresProjector] = useState<boolean>(true);
  const [preferredWing, setPreferredWing] = useState<'all' | WingType>('all');
  const [purpose, setPurpose] = useState<string>(initialPurpose || (currentUser?.role === 'faculty' ? 'extra class' : 'regular class'));

  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(initialRoomNumber || null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validation warnings
  const timeError = useMemo(() => {
    if (!startTime || !endTime) return 'Start and End time are required.';
    if (endTime <= startTime) return 'End time must be strictly after start time.';
    if (isTimeInPastIST(date, startTime)) return 'Selected time is in the past (IST). Please select a future time.';
    return null;
  }, [date, startTime, endTime]);

  // Compute suitable rooms and check availability for the requested time range
  const { suitableRooms, alternativeRooms } = useMemo(() => {
    if (timeError) {
      return { suitableRooms: [], alternativeRooms: [] };
    }

    const suitable: Array<{ room: Classroom; isAvailable: boolean; conflictReason?: string }> = [];
    const alternatives: Classroom[] = [];

    rawClassrooms.forEach((room) => {
      // Check for overlap on this room for the given date and start/end time
      const conflictingBooking = bookings.find((b) =>
        checkBookingOverlap(b, {
          roomNumber: room.roomNumber,
          date,
          startTime,
          endTime,
        })
      );

      const isAvailable = !conflictingBooking && room.status !== 'maintenance';
      const meetsCapacity = room.capacity >= studentCount;
      const meetsProjector = !requiresProjector || room.hasProjector;
      const meetsWing = preferredWing === 'all' || room.wing === preferredWing;

      if (meetsCapacity && meetsProjector && meetsWing) {
        suitable.push({
          room,
          isAvailable,
          conflictReason: conflictingBooking
            ? `Booked by ${conflictingBooking.bookedByName} (${conflictingBooking.startTime} - ${conflictingBooking.endTime})`
            : undefined,
        });
      } else if (isAvailable && room.capacity >= studentCount) {
        // Potential alternative room
        alternatives.push(room);
      }
    });

    // Sort suitable rooms by "best fit" (smallest room that fits first)
    suitable.sort((a, b) => {
      // Available first
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
      // Smallest capacity that fits
      return a.room.capacity - b.room.capacity;
    });

    alternatives.sort((a, b) => a.capacity - b.capacity);

    return { suitableRooms: suitable, alternativeRooms: alternatives };
  }, [rawClassrooms, bookings, date, startTime, endTime, studentCount, requiresProjector, preferredWing, timeError]);

  if (!isOpen) return null;

  const isCR = currentUser?.role === 'cr';
  const crRecord = isCR ? crs.find((c) => c.userId === currentUser?.id || c.name === currentUser?.name) : null;
  const isCRBlocked = isCR && crRecord && !crRecord.canBook;

  const handleBookRoom = async (roomNumberToBook: string) => {
    setConflictError(null);
    setIsSubmitting(true);
    setSelectedRoomNumber(roomNumberToBook);

    try {
      const res = await createBooking({
        roomNumber: roomNumberToBook,
        section,
        date,
        startTime,
        endTime,
        purpose,
        studentCount,
        requiresProjector,
        personId: selectedPersonId,
        personName: selectedPersonName,
      });

      if (!res.success) {
        setConflictError(res.error || 'Failed to book room.');
      } else {
        setBookingSuccess(true);
        setTimeout(() => {
          onClose();
          setBookingSuccess(false);
          setConflictError(null);
        }, 1500);
      }
    } catch {
      setConflictError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="search-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Flexible Classroom Booking
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  IST (UTC+5:30)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter Date, Start &amp; End time. Instant direct booking with automatic overlap prevention.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permission Guard Alert */}
        {isCRBlocked && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 px-5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              Your CR booking privilege for <strong>{crRecord?.section}</strong> is currently paused by Admin. You can browse availability but cannot submit bookings.
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Requirement Inputs Grid */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Booking Time &amp; Requirements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date (IST)
                </label>
                <input
                  type="date"
                  value={date}
                  min={getISTDateString()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Time (IST)
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{formatTime12h(startTime)}</span>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Time (IST)
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">{formatTime12h(endTime)}</span>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Section
                </label>
                {isCR ? (
                  <div className="w-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200">
                    {section} (CR Assigned)
                  </div>
                ) : (
                  <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {OFFICIAL_SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Row 2: Headcount, Projector, Wing, Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Student Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Student Count: <span className="font-mono text-indigo-600 dark:text-indigo-400">{studentCount}</span>
                </label>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Projector Required */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Projector Facility
                </label>
                <button
                  type="button"
                  onClick={() => setRequiresProjector(!requiresProjector)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-between border transition-colors cursor-pointer ${
                    requiresProjector
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Projector Required</span>
                  </span>
                  <span>{requiresProjector ? 'Yes' : 'No'}</span>
                </button>
              </div>

              {/* Wing Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Wing Preference
                </label>
                <select
                  value={preferredWing}
                  onChange={(e) => setPreferredWing(e.target.value as 'all' | WingType)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Any Wing (All 20 Rooms)</option>
                  <option value="Left Wing">Left Wing (L-101..110)</option>
                  <option value="Right Wing">Right Wing (R-101..110)</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="regular class">Regular Class</option>
                  <option value="extra class">Extra Class</option>
                  <option value="seminar">Seminar / Workshop</option>
                  <option value="meeting">Section Meeting</option>
                  <option value="other">Other Academic</option>
                </select>
              </div>
            </div>

            {/* Time Validation Warning */}
            {timeError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}
          </div>

          {/* Conflict Error Message Display */}
          {conflictError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/70 border-l-4 border-rose-600 rounded-xl text-rose-800 dark:text-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-900 dark:text-rose-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Booking Conflict Detected</span>
              </div>
              <p>{conflictError}</p>
            </div>
          )}

          {/* Booking Success Banner */}
          {bookingSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">Room Successfully Booked!</p>
                <p>Status set to Confirmed. Availability updated instantly in IST.</p>
              </div>
            </div>
          )}

          {/* Room Selection Grid (Sorted by Best Fit) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>2. Available Classrooms (Best Fit First)</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {suitableRooms.filter((r) => r.isAvailable).length} Available
                </span>
              </h3>
            </div>

            {suitableRooms.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Building className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  No classrooms match all requirements.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Try reducing student headcount, selecting &apos;Any Wing&apos;, or checking a different time slot.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suitableRooms.map(({ room, isAvailable, conflictReason }, idx) => {
                  const isSelected = selectedRoomNumber === room.roomNumber;

                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isAvailable
                          ? isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-600 ring-2 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                                {room.roomNumber}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {room.wing}
                              </span>
                              {idx === 0 && isAvailable && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5" /> Best Fit
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              Floor {room.floor} · Capacity: <strong>{room.capacity} seats</strong>
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAvailable
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Occupied'}
                          </span>
                        </div>

                        {/* Facilities */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                          {room.hasProjector && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                              <Tv className="w-3 h-3" /> Projector
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            <Users2 className="w-3 h-3" /> Fit: {room.capacity - studentCount} extra
                          </span>
                        </div>

                        {conflictReason && (
                          <p className="text-[11px] text-rose-600 dark:text-rose-400 mb-2 font-medium">
                            {conflictReason}
                          </p>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        disabled={!isAvailable || isCRBlocked || isSubmitting}
                        onClick={() => handleBookRoom(room.roomNumber)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          !isAvailable || isCRBlocked
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-xs'
                        }`}
                      >
                        {isSubmitting && isSelected ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <span>Direct Book {room.roomNumber}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Alternatives if suitable are limited */}
            {alternativeRooms.length > 0 && suitableRooms.filter((r) => r.isAvailable).length === 0 && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alternative Rooms Available in Other Wings/Specs:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {alternativeRooms.slice(0, 4).map((alt) => (
                    <div
                      key={alt.id}
                      className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold">{alt.roomNumber}</span> ({alt.wing}) · {alt.capacity} seats
                      </div>
                      <button
                        type="button"
                        disabled={isCRBlocked || isSubmitting}
                        onClick={() => handleBookRoom(alt.roomNumber)}
                        className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[11px] font-semibold hover:bg-indigo-700 cursor-pointer"
                      >
                        Book
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40 shrink-0">
          <span>Booking as <strong>{selectedPersonName || currentUser?.name}</strong> ({currentUser?.role.toUpperCase()})</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
