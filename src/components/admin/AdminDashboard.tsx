import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CRDetails, FacultyDetails, Booking } from '../../types';
import { OFFICIAL_SECTIONS } from '../../data/seedData';
import { WingVisualPlan } from '../classroom/WingVisualPlan';
import { CancelBookingModal } from '../common/CancelBookingModal';
import { SearchAndBookModal } from '../booking/SearchAndBookModal';
import {
  ShieldCheck,
  Users2,
  GraduationCap,
  Building,
  Calendar,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Layers,
  Settings,
  X,
  Lock,
} from 'lucide-react';
import { formatTime12h, getISTDateString, formatISTDisplay } from '../../utils/istTime';

export const AdminDashboard: React.FC = () => {
  const {
    adminConfig,
    crs,
    facultyList,
    bookings,
    classrooms,
    addCR,
    updateCR,
    deleteCR,
    addFaculty,
    updateFaculty,
    deleteFaculty,
    cancelBooking,
    istNow,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'crs' | 'faculty' | 'bookings' | 'classrooms' | 'settings'>('crs');

  // CR Modal State
  const [isCRModalOpen, setIsCRModalOpen] = useState(false);
  const [editingCR, setEditingCR] = useState<CRDetails | null>(null);
  const [crName, setCrName] = useState('');
  const [crSection, setCrSection] = useState<string>(OFFICIAL_SECTIONS[0]);
  const [crEmail, setCrEmail] = useState('');
  const [crCanBook, setCrCanBook] = useState(true);
  const [crError, setCrError] = useState<string | null>(null);

  // Faculty Modal State
  const [isFacModalOpen, setIsFacModalOpen] = useState(false);
  const [editingFac, setEditingFac] = useState<FacultyDetails | null>(null);
  const [facName, setFacName] = useState('');
  const [facSubject, setFacSubject] = useState('');
  const [facSection, setFacSection] = useState<string>(OFFICIAL_SECTIONS[0]);
  const [facEmail, setFacEmail] = useState('');
  const [facError, setFacError] = useState<string | null>(null);

  // Cancellation Modal State
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Quick Book Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [prefilledRoomNumber, setPrefilledRoomNumber] = useState<string | undefined>(undefined);

  // Filters for Bookings
  const [bookingFilterSection, setBookingFilterSection] = useState<string>('all');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterSection !== 'all' && b.section !== bookingFilterSection) return false;
    if (bookingFilterStatus !== 'all' && b.status !== bookingFilterStatus) return false;
    return true;
  });

  // CR Handlers
  const openAddCRModal = () => {
    setEditingCR(null);
    setCrName('');
    // Select first unoccupied section if available
    const occupiedSections = new Set(crs.map((c) => c.section));
    const availableSection = OFFICIAL_SECTIONS.find((s) => !occupiedSections.has(s)) || OFFICIAL_SECTIONS[0];
    setCrSection(availableSection);
    setCrEmail('');
    setCrCanBook(true);
    setCrError(null);
    setIsCRModalOpen(true);
  };

  const openEditCRModal = (cr: CRDetails) => {
    setEditingCR(cr);
    setCrName(cr.name);
    setCrSection(cr.section);
    setCrEmail(cr.email || '');
    setCrCanBook(cr.canBook);
    setCrError(null);
    setIsCRModalOpen(true);
  };

  const handleSaveCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrError(null);

    if (editingCR) {
      const res = await updateCR(editingCR.id, {
        name: crName,
        section: crSection,
        email: crEmail,
        canBook: crCanBook,
      });
      if (!res.success) setCrError(res.error || 'Failed to update CR.');
      else setIsCRModalOpen(false);
    } else {
      const res = await addCR({
        name: crName,
        section: crSection,
        email: crEmail,
        canBook: crCanBook,
      });
      if (!res.success) setCrError(res.error || 'Failed to add CR.');
      else setIsCRModalOpen(false);
    }
  };

  // Faculty Handlers
  const openAddFacModal = () => {
    setEditingFac(null);
    setFacName('');
    setFacSubject('');
    setFacSection(OFFICIAL_SECTIONS[0]);
    setFacEmail('');
    setFacError(null);
    setIsFacModalOpen(true);
  };

  const openEditFacModal = (fac: FacultyDetails) => {
    setEditingFac(fac);
    setFacName(fac.name);
    setFacSubject(fac.subject);
    setFacSection(fac.section);
    setFacEmail(fac.email || '');
    setFacError(null);
    setIsFacModalOpen(true);
  };

  const handleSaveFac = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacError(null);

    if (editingFac) {
      const res = await updateFaculty(editingFac.id, {
        name: facName,
        subject: facSubject,
        section: facSection,
        email: facEmail,
      });
      if (!res.success) setFacError(res.error || 'Failed to update faculty.');
      else setIsFacModalOpen(false);
    } else {
      const res = await addFaculty({
        name: facName,
        subject: facSubject,
        section: facSection,
        email: facEmail,
      });
      if (!res.success) setFacError(res.error || 'Failed to add faculty.');
      else setIsFacModalOpen(false);
    }
  };

  const triggerCancelBooking = (booking: Booking) => {
    setSelectedBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / System Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Admin Management Console
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                CSE Department
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full control over 5 Section CRs, Faculty roster, 20 classrooms, and all bookings.
            </p>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <Users2 className="w-4 h-4 text-indigo-500" />
            <span>CRs: <strong>{crs.length} / 5</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-emerald-500" />
            <span>Faculty: <strong>{facultyList.length}</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
            <Building className="w-4 h-4 text-violet-500" />
            <span>Rooms: <strong>{classrooms.length} (2 Wings)</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('crs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'crs'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>CR Details (5 Sections)</span>
        </button>

        <button
          onClick={() => setActiveTab('faculty')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'faculty'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Faculty Details</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Bookings ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classrooms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'classrooms'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Classrooms View (20)</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Protected Admin Config</span>
        </button>
      </div>

      {/* TAB 1: CR Details (Exactly 5 sections) */}
      {activeTab === 'crs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Class Representative (CR) Management
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Exactly 5 CRs for 5 Sections
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Each of the 5 official CSE Sections (Section A through E) has exactly 1 registered CR.
              </p>
            </div>

            <button
              onClick={openAddCRModal}
              disabled={crs.length >= 5}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                crs.length >= 5
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{crs.length >= 5 ? 'Quota Full (5/5 CRs)' : 'Add New CR'}</span>
            </button>
          </div>

          {/* CR Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crs.map((cr) => (
              <div
                key={cr.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {cr.section}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-2 text-sm">
                        {cr.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {cr.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateCR(cr.id, { canBook: !cr.canBook })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                        cr.canBook
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                      title="Click to toggle booking authorization"
                    >
                      {cr.canBook ? 'Can Book' : 'Booking Paused'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => openEditCRModal(cr)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Edit CR details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCR(cr.id)}
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                    title="Delete CR"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Faculty Details (Unlimited) */}
      {activeTab === 'faculty' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Faculty Roster Management
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Unlimited Faculty
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage professor records with subjects taught and associated sections.
              </p>
            </div>

            <button
              onClick={openAddFacModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Faculty Member</span>
            </button>
          </div>

          {/* Faculty Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="p-3">Faculty Name</th>
                  <th className="p-3">Subject / Specialization</th>
                  <th className="p-3">Section Assigned</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {facultyList.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{fac.name}</span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                      {fac.subject}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
                        {fac.section}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {fac.email}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => openEditFacModal(fac)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Faculty"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteFaculty(fac.id)}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Delete Faculty"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: All Bookings (With Cancel Booking button) */}
      {activeTab === 'bookings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All Department Bookings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Admin has master authority to view and cancel any booking across all sections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={bookingFilterSection}
                onChange={(e) => setBookingFilterSection(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="all">All Sections</option>
                {OFFICIAL_SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>

              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
              >
                <option value="all">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No bookings found.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                All classrooms are currently free and available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="p-3">Room</th>
                    <th className="p-3">Section</th>
                    <th className="p-3">Date (IST)</th>
                    <th className="p-3">Time Range</th>
                    <th className="p-3">Booked By</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                        {b.roomNumber}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {b.section}
                      </td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">
                        {b.date}
                      </td>
                      <td className="p-3 font-mono text-indigo-600 dark:text-indigo-400">
                        {b.startTime} - {b.endTime} ({formatTime12h(b.startTime)} - {formatTime12h(b.endTime)})
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        <span className="font-medium">{b.bookedByName}</span>{' '}
                        <span className="text-[10px] text-slate-400 uppercase">({b.role})</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {b.status === 'Confirmed' ? (
                          <button
                            type="button"
                            onClick={() => triggerCancelBooking(b)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors cursor-pointer"
                          >
                            Cancel Booking
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Classrooms View (20 Rooms) */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          <WingVisualPlan
            onSelectRoomForBooking={(roomNumber) => {
              setPrefilledRoomNumber(roomNumber);
              setIsBookModalOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 5: Protected Admin Config */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Protected System Admin Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule 1: Exactly ONE Admin. Stored in protected config document.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Config Document Path:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  /config/admin
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Designated Admin UID:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {adminConfig.adminUid}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Designated Admin Email:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {adminConfig.adminEmail}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Scope Department:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {adminConfig.department}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-bold">Security Constraint Enforced:</p>
              <p>
                - The Admin role cannot be self-registered or chosen at signup.
                <br />
                - Users can never edit their own role (enforced in Security Rules: <code>!request.resource.data.diff(resource.data).affectedKeys().hasAny([&apos;role&apos;])</code>).
                <br />
                - Exactly 5 CRs are enforced for the 5 CSE Sections.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit CR Modal */}
      {isCRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCR ? 'Edit Class Representative' : 'Add Class Representative'}
              </h3>
              <button
                onClick={() => setIsCRModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {crError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {crError}
              </div>
            )}

            <form onSubmit={handleSaveCR} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">CR Full Name</label>
                <input
                  type="text"
                  required
                  value={crName}
                  onChange={(e) => setCrName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Section (1 CR per Section)</label>
                <select
                  value={crSection}
                  onChange={(e) => setCrSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {OFFICIAL_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={crEmail}
                  onChange={(e) => setCrEmail(e.target.value)}
                  placeholder="cr.section@cse.university.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="canBookCheck"
                  checked={crCanBook}
                  onChange={(e) => setCrCanBook(e.target.checked)}
                  className="accent-indigo-600"
                />
                <label htmlFor="canBookCheck" className="font-medium text-slate-700 dark:text-slate-300">
                  Authorize direct classroom booking
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCRModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Save CR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      {isFacModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingFac ? 'Edit Faculty Member' : 'Add Faculty Member'}
              </h3>
              <button
                onClick={() => setIsFacModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {facError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 rounded-lg text-rose-700 text-xs">
                {facError}
              </div>
            )}

            <form onSubmit={handleSaveFac} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Faculty Name</label>
                <input
                  type="text"
                  required
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  placeholder="e.g. Prof. David Kumar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={facSubject}
                  onChange={(e) => setFacSubject(e.target.value)}
                  placeholder="e.g. Database Management Systems"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Section Assigned</label>
                <select
                  value={facSection}
                  onChange={(e) => setFacSection(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {OFFICIAL_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={facEmail}
                  onChange={(e) => setFacEmail(e.target.value)}
                  placeholder="professor@cse.university.edu"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFacModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Save Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Cancellation */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        booking={selectedBookingToCancel}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBookingToCancel(null);
        }}
        onConfirmCancel={async (bookingId) => {
          await cancelBooking(bookingId);
        }}
      />

      {/* Direct Booking Modal */}
      <SearchAndBookModal
        isOpen={isBookModalOpen}
        onClose={() => {
          setIsBookModalOpen(false);
          setPrefilledRoomNumber(undefined);
        }}
        initialRoomNumber={prefilledRoomNumber}
      />
    </div>
  );
};
