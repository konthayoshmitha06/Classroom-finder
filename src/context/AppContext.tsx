/**
 * AppContext: Source of Truth for RBAC, Flexible Bookings, Live Availability,
 * and Admin Management of CRs and Faculty.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserAccount,
  UserRole,
  Classroom,
  Booking,
  CRDetails,
  FacultyDetails,
  SystemConfig,
  NotificationItem,
} from '../types';
import {
  subscribeToClassrooms,
  subscribeToBookings,
  subscribeToCRs,
  subscribeToFaculty,
  dbCreateBooking,
  dbUpdateBooking,
  dbSaveCR,
  dbDeleteCR,
  dbSaveFaculty,
  dbDeleteFaculty,
  getAdminConfig,
  getLocalUsers,
  authenticateRoleUser,
  logoutAuth,
} from '../services/firebase';
import {
  getISTNow,
  getISTDateString,
  getISTTimeString,
  isTimeInPastIST,
  isBookingActiveNowIST,
  checkBookingOverlap,
  formatTime12h,
  formatISTDisplay,
} from '../utils/istTime';
import { OFFICIAL_SECTIONS, INITIAL_NOTIFICATIONS } from '../data/seedData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface ComputedRoom extends Classroom {
  liveStatus: 'Available' | 'Booked' | 'Maintenance';
  activeBooking?: Booking;
  nextBooking?: Booking;
}

interface AppContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  adminConfig: SystemConfig;
  classrooms: ComputedRoom[];
  rawClassrooms: Classroom[];
  bookings: Booking[];
  activeBookings: Booking[];
  crs: CRDetails[];
  facultyList: FacultyDetails[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  istNow: Date;

  // Shared Login Persona Selection (Booking As: ...)
  selectedPersonId: string;
  selectedPersonName: string;
  setSelectedPerson: (personId: string, personName: string) => void;

  // Actions
  login: (userOrId: string | UserAccount) => void;
  loginWithCredentials: (email: string, pass: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userOrId: string | UserAccount) => void;

  createBooking: (params: {
    roomNumber: string;
    section: string;
    date: string;
    startTime: string;
    endTime: string;
    personId?: string;
    personName?: string;
    purpose?: string;
    studentCount?: number;
    requiresProjector?: boolean;
  }) => Promise<{ success: boolean; error?: string; booking?: Booking }>;

  cancelBooking: (bookingId: string) => Promise<void>;

  // CR Management (5 sections)
  addCR: (cr: Omit<CRDetails, 'id' | 'department'>) => Promise<{ success: boolean; error?: string }>;
  updateCR: (id: string, updates: Partial<CRDetails>) => Promise<{ success: boolean; error?: string }>;
  deleteCR: (id: string) => Promise<void>;

  // Faculty Management (Unlimited)
  addFaculty: (fac: Omit<FacultyDetails, 'id' | 'department'>) => Promise<{ success: boolean; error?: string }>;
  updateFaculty: (id: string, updates: Partial<FacultyDetails>) => Promise<{ success: boolean; error?: string }>;
  deleteFaculty: (id: string) => Promise<void>;

  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('cse_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rawClassrooms, setRawClassrooms] = useState<Classroom[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [crs, setCrs] = useState<CRDetails[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyDetails[]>([]);
  const [adminConfig] = useState<SystemConfig>(getAdminConfig());
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [users] = useState<UserAccount[]>(getLocalUsers());

  // IST Clock tick every 30 seconds for live room availability updates
  const [istNow, setIstNow] = useState<Date>(getISTNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setIstNow(getISTNow());
    }, 30000); // 30-second interval re-evaluation as required
    return () => clearInterval(timer);
  }, []);

  // Real-time Firestore/Local state subscriptions
  useEffect(() => {
    const unsubRooms = subscribeToClassrooms(setRawClassrooms);
    const unsubBookings = subscribeToBookings(setBookings);
    const unsubCRs = subscribeToCRs(setCrs);
    const unsubFaculty = subscribeToFaculty(setFacultyList);

    return () => {
      unsubRooms();
      unsubBookings();
      unsubCRs();
      unsubFaculty();
    };
  }, []);

  // Shared Login Persona Selection (Booking As: ...)
  const [selectedPersonId, setSelectedPersonId] = useState<string>(() => {
    return localStorage.getItem('cse_selected_person_id') || '';
  });
  const [selectedPersonName, setSelectedPersonName] = useState<string>(() => {
    return localStorage.getItem('cse_selected_person_name') || '';
  });

  const setSelectedPerson = useCallback((personId: string, personName: string) => {
    setSelectedPersonId(personId);
    setSelectedPersonName(personName);
    localStorage.setItem('cse_selected_person_id', personId);
    localStorage.setItem('cse_selected_person_name', personName);
  }, []);

  // Sync default persona when facultyList or crs load
  useEffect(() => {
    if (currentUser?.role === 'faculty' && facultyList.length > 0) {
      if (!selectedPersonId || !facultyList.some((f) => f.id === selectedPersonId)) {
        setSelectedPersonId(facultyList[0].id);
        setSelectedPersonName(facultyList[0].name);
        localStorage.setItem('cse_selected_person_id', facultyList[0].id);
        localStorage.setItem('cse_selected_person_name', facultyList[0].name);
      }
    } else if (currentUser?.role === 'cr' && crs.length > 0) {
      if (!selectedPersonId || !crs.some((c) => c.id === selectedPersonId)) {
        setSelectedPersonId(crs[0].id);
        setSelectedPersonName(crs[0].name);
        localStorage.setItem('cse_selected_person_id', crs[0].id);
        localStorage.setItem('cse_selected_person_name', crs[0].name);
      }
    } else if (currentUser?.role === 'admin') {
      setSelectedPersonId(currentUser.id);
      setSelectedPersonName(currentUser.name);
    }
  }, [currentUser, facultyList, crs, selectedPersonId]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loginWithCredentials = useCallback(
    async (email: string, pass: string, role: UserRole) => {
      try {
        const user = await authenticateRoleUser(email, pass, role);
        setCurrentUser(user);
        localStorage.setItem('cse_active_user', JSON.stringify(user));

        if (role === 'faculty' && facultyList.length > 0) {
          setSelectedPerson(facultyList[0].id, facultyList[0].name);
        } else if (role === 'cr' && crs.length > 0) {
          setSelectedPerson(crs[0].id, crs[0].name);
        } else {
          setSelectedPerson(user.id, user.name);
        }

        addToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`, 'success');
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
        return { success: false, error: message };
      }
    },
    [facultyList, crs, setSelectedPerson, addToast]
  );

  const login = useCallback((userOrId: string | UserAccount) => {
    let user: UserAccount | undefined;
    if (typeof userOrId === 'string') {
      user = users.find((u) => u.id === userOrId);
    } else {
      user = userOrId;
    }

    if (user) {
      setCurrentUser(user);
      localStorage.setItem('cse_active_user', JSON.stringify(user));
      addToast(`Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
    }
  }, [users, addToast]);

  const logout = useCallback(async () => {
    await logoutAuth();
    setCurrentUser(null);
    setSelectedPersonId('');
    setSelectedPersonName('');
    localStorage.removeItem('cse_active_user');
    localStorage.removeItem('cse_selected_person_id');
    localStorage.removeItem('cse_selected_person_name');
    addToast('Logged out successfully', 'info');
  }, [addToast]);

  const switchUser = useCallback((userOrId: string | UserAccount) => {
    login(userOrId);
  }, [login]);

  /**
   * REAL-TIME AVAILABILITY CALCULATION
   * Status is dynamically computed from bookings + current IST time, NEVER from static flags.
   * - Shows 'Booked' ONLY while current IST time is within an active booking [startTime, endTime) on today's date.
   * - When end time passes, room automatically reverts to 'Available' (or follows next active booking).
   * - Expired or cancelled bookings NEVER display a room as occupied.
   */
  const classrooms: ComputedRoom[] = useMemo(() => {
    const todayIST = getISTDateString(istNow);
    const currentISTTime = getISTTimeString(istNow);

    return rawClassrooms.map((room) => {
      // Find all confirmed bookings for this room today
      const roomBookings = bookings.filter(
        (b) => b.roomNumber === room.roomNumber && b.date === todayIST && b.status === 'Confirmed'
      );

      // Check if any booking is currently active in IST
      const activeBooking = roomBookings.find((b) =>
        isBookingActiveNowIST(b.date, b.startTime, b.endTime, b.status)
      );

      // Check upcoming next booking today
      const futureBookings = roomBookings
        .filter((b) => b.startTime > currentISTTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      const nextBooking = futureBookings[0];

      let liveStatus: 'Available' | 'Booked' | 'Maintenance' = 'Available';

      if (room.status === 'maintenance') {
        liveStatus = 'Maintenance';
      } else if (activeBooking) {
        liveStatus = 'Booked';
      }

      return {
        ...room,
        liveStatus,
        activeBooking,
        nextBooking,
      };
    });
  }, [rawClassrooms, bookings, istNow]);

  const activeBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'Confirmed');
  }, [bookings]);

  /**
   * FLEXIBLE BOOKING WITH ATOMIC OVERLAP VALIDATION
   */
  const createBooking = useCallback(
    async (params: {
      roomNumber: string;
      section: string;
      date: string;
      startTime: string;
      endTime: string;
      personId?: string;
      personName?: string;
      purpose?: string;
      studentCount?: number;
      requiresProjector?: boolean;
    }): Promise<{ success: boolean; error?: string; booking?: Booking }> => {
      if (!currentUser) {
        return { success: false, error: 'You must be logged in to book a classroom.' };
      }

      // Role check: Only registered CRs and faculty (and Admin) can book
      if (currentUser.role === 'student') {
        return { success: false, error: 'Students have view-only access and cannot book rooms.' };
      }

      // CR Permission check
      if (currentUser.role === 'cr') {
        const effectiveId = params.personId || selectedPersonId;
        const crRecord = crs.find((c) => c.id === effectiveId || c.userId === currentUser.id || c.name === currentUser.name);
        if (crRecord && !crRecord.canBook) {
          return { success: false, error: 'Your booking authorization has been temporarily paused by Admin.' };
        }
      }

      const {
        roomNumber,
        section,
        date,
        startTime,
        endTime,
        purpose,
        studentCount,
        requiresProjector,
        personId: paramPersonId,
        personName: paramPersonName,
      } = params;

      const effectivePersonId = paramPersonId || selectedPersonId || currentUser.id;
      const effectivePersonName = paramPersonName || selectedPersonName || currentUser.name;

      // 1. Validate start and end times
      if (!date || !startTime || !endTime || !roomNumber || !section) {
        return { success: false, error: 'Please provide all required fields (Date, Start Time, End Time, Room, Section).' };
      }

      if (endTime <= startTime) {
        return { success: false, error: 'End time must be after start time.' };
      }

      // 2. Validate booking is not in the past (IST)
      if (isTimeInPastIST(date, startTime)) {
        return {
          success: false,
          error: `Cannot book in the past. Current IST time is ${formatISTDisplay(getISTNow())}.`,
        };
      }

      // 3. Check for overlapping bookings in the database
      // Overlap rule: newStart < existingEnd AND newEnd > existingStart (ignoring cancelled & expired)
      const conflict = bookings.find((b) =>
        checkBookingOverlap(b, {
          roomNumber,
          date,
          startTime,
          endTime,
        })
      );

      if (conflict) {
        return {
          success: false,
          error: `Conflict Detected: Room ${roomNumber} is already booked on ${date} from ${conflict.startTime} to ${conflict.endTime} (${formatTime12h(conflict.startTime)} - ${formatTime12h(conflict.endTime)} IST) by ${conflict.bookedByName || conflict.personName || 'User'} (${conflict.section}). Please select another time or room.`,
        };
      }

      // 4. Save booking in Firestore
      const newBooking: Booking = {
        id: `bk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        roomNumber,
        section,
        date,
        startTime,
        endTime,
        bookedBy: currentUser.id,
        personId: effectivePersonId,
        personName: effectivePersonName,
        bookedByName: effectivePersonName,
        role: currentUser.role,
        status: 'Confirmed',
        createdAt: new Date().toISOString(),
        purpose: purpose || 'regular class',
        studentCount: studentCount || 50,
        requiresProjector: requiresProjector || false,
        department: 'CSE',
      };

      try {
        await dbCreateBooking(newBooking);

        // Auto-generate notification
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          title: `Classroom ${roomNumber} Booked`,
          message: `${effectivePersonName} (${currentUser.role.toUpperCase()}) booked ${roomNumber} for ${section} on ${date} from ${startTime} to ${endTime} IST.`,
          category: 'booking',
          roomNumber,
          date,
          startTime,
          endTime,
          purpose: newBooking.purpose,
          section,
          bookedByName: effectivePersonName,
          bookedByRole: currentUser.role,
          bookingTime: formatISTDisplay(),
          recipientUserIds: ['all'],
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        setNotifications((prev) => [newNotif, ...prev]);
        addToast(`Room ${roomNumber} successfully booked for ${section}!`, 'success');
        return { success: true, booking: newBooking };
      } catch (e) {
        console.error('Error creating booking:', e);
        return { success: false, error: 'Database error saving booking. Please try again.' };
      }
    },
    [currentUser, crs, selectedPersonId, selectedPersonName, bookings, addToast]
  );

  /**
   * CANCEL BOOKING
   * - Users can cancel ONLY their own bookings (matching personId and role). Admin can cancel any.
   * - On confirm, sets status to 'Cancelled' in Firestore.
   * - Cancelled bookings immediately stop blocking the room and remain cancelled after refresh.
   */
  const cancelBooking = useCallback(
    async (bookingId: string) => {
      const target = bookings.find((b) => b.id === bookingId);
      if (!target) {
        addToast('Booking not found.', 'error');
        return;
      }

      if (!currentUser) {
        addToast('Please login to cancel a booking.', 'error');
        return;
      }

      // Ownership check: Users can cancel ONLY their own bookings (matching personId and role). Admin can cancel any.
      if (currentUser.role !== 'admin') {
        const effectiveId = selectedPersonId || currentUser.id;
        const isOwner = target.role === currentUser.role && (target.personId === effectiveId || target.bookedBy === currentUser.id);
        if (!isOwner) {
          addToast('Unauthorized: You can only cancel your own bookings.', 'error');
          return;
        }
      }

      try {
        await dbUpdateBooking(bookingId, {
          status: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          cancelledBy: currentUser.name,
        });

        // Add cancellation notification
        const notif: NotificationItem = {
          id: `notif-cancel-${Date.now()}`,
          title: `Booking Cancelled: ${target.roomNumber}`,
          message: `${target.personName || target.bookedByName || currentUser.name} cancelled the booking for Room ${target.roomNumber} on ${target.date} (${target.startTime} - ${target.endTime}). Room is now free.`,
          category: 'cancellation',
          roomNumber: target.roomNumber,
          date: target.date,
          startTime: target.startTime,
          endTime: target.endTime,
          section: target.section,
          bookedByName: currentUser.name,
          bookedByRole: currentUser.role,
          bookingTime: formatISTDisplay(),
          recipientUserIds: ['all'],
          createdAt: new Date().toISOString(),
          isRead: false,
        };

        setNotifications((prev) => [notif, ...prev]);
        addToast(`Booking for ${target.roomNumber} cancelled. Slot is now available.`, 'info');
      } catch (e) {
        console.error('Failed to cancel booking:', e);
        addToast('Failed to cancel booking. Please try again.', 'error');
      }
    },
    [bookings, currentUser, selectedPersonId, addToast]
  );

  /**
   * CR MANAGEMENT (Exactly 5 CRs for 5 sections)
   */
  const addCR = useCallback(
    async (data: Omit<CRDetails, 'id' | 'department'>): Promise<{ success: boolean; error?: string }> => {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Only Admin can manage Class Representatives.' };
      }

      if (crs.length >= 5) {
        return {
          success: false,
          error: 'Maximum 5 CRs reached. The CSE Department permits exactly 5 CRs for 5 sections.',
        };
      }

      if (!data.name.trim() || !data.section.trim()) {
        return { success: false, error: 'Name and Section are required.' };
      }

      // Check section uniqueness
      const sectionExists = crs.some((c) => c.section.toLowerCase() === data.section.toLowerCase());
      if (sectionExists) {
        return {
          success: false,
          error: `A CR is already registered for ${data.section}. Each of the 5 sections has exactly 1 CR.`,
        };
      }

      const newCR: CRDetails = {
        id: `cr-${Date.now()}`,
        name: data.name.trim(),
        section: data.section,
        email: data.email || `cr.${data.section.toLowerCase().replace(/\s+/g, '')}@cse.university.edu`,
        canBook: data.canBook ?? true,
        department: 'CSE',
        createdAt: new Date().toISOString(),
      };

      await dbSaveCR(newCR);
      addToast(`Added CR ${newCR.name} for ${newCR.section}`, 'success');
      return { success: true };
    },
    [currentUser, crs, addToast]
  );

  const updateCR = useCallback(
    async (id: string, updates: Partial<CRDetails>): Promise<{ success: boolean; error?: string }> => {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Only Admin can edit CR details.' };
      }

      const existing = crs.find((c) => c.id === id);
      if (!existing) return { success: false, error: 'CR not found.' };

      // If section is changed, check uniqueness
      if (updates.section && updates.section !== existing.section) {
        const sectionTaken = crs.some(
          (c) => c.id !== id && c.section.toLowerCase() === updates.section?.toLowerCase()
        );
        if (sectionTaken) {
          return { success: false, error: `Section ${updates.section} already has an assigned CR.` };
        }
      }

      const updated = { ...existing, ...updates };
      await dbSaveCR(updated);
      addToast(`Updated CR details for ${updated.name}`, 'success');
      return { success: true };
    },
    [currentUser, crs, addToast]
  );

  const deleteCR = useCallback(
    async (id: string) => {
      if (currentUser?.role !== 'admin') {
        addToast('Only Admin can delete CRs.', 'error');
        return;
      }
      await dbDeleteCR(id);
      addToast('CR record deleted.', 'info');
    },
    [currentUser, addToast]
  );

  /**
   * FACULTY MANAGEMENT (Unlimited faculty)
   */
  const addFaculty = useCallback(
    async (data: Omit<FacultyDetails, 'id' | 'department'>): Promise<{ success: boolean; error?: string }> => {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Only Admin can add faculty.' };
      }

      if (!data.name.trim() || !data.subject.trim() || !data.section.trim()) {
        return { success: false, error: 'Name, Subject, and Section are all required.' };
      }

      const newFaculty: FacultyDetails = {
        id: `fac-${Date.now()}`,
        name: data.name.trim(),
        subject: data.subject.trim(),
        section: data.section,
        email: data.email || `${data.name.toLowerCase().replace(/[^a-z]/g, '')}@cse.university.edu`,
        department: 'CSE',
        createdAt: new Date().toISOString(),
      };

      await dbSaveFaculty(newFaculty);
      addToast(`Added faculty member ${newFaculty.name}`, 'success');
      return { success: true };
    },
    [currentUser, addToast]
  );

  const updateFaculty = useCallback(
    async (id: string, updates: Partial<FacultyDetails>): Promise<{ success: boolean; error?: string }> => {
      if (currentUser?.role !== 'admin') {
        return { success: false, error: 'Only Admin can edit faculty details.' };
      }

      const existing = facultyList.find((f) => f.id === id);
      if (!existing) return { success: false, error: 'Faculty not found.' };

      const updated = { ...existing, ...updates };
      await dbSaveFaculty(updated);
      addToast(`Updated faculty details for ${updated.name}`, 'success');
      return { success: true };
    },
    [currentUser, facultyList, addToast]
  );

  const deleteFaculty = useCallback(
    async (id: string) => {
      if (currentUser?.role !== 'admin') {
        addToast('Only Admin can delete faculty.', 'error');
        return;
      }
      await dbDeleteFaculty(id);
      addToast('Faculty member removed.', 'info');
    },
    [currentUser, addToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const unreadNotifsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        adminConfig,
        classrooms,
        rawClassrooms,
        bookings,
        activeBookings,
        crs,
        facultyList,
        notifications,
        unreadNotifsCount,
        istNow,
        selectedPersonId,
        selectedPersonName,
        setSelectedPerson,
        login,
        loginWithCredentials,
        logout,
        switchUser,
        createBooking,
        cancelBooking,
        addCR,
        updateCR,
        deleteCR,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        toasts,
        addToast,
        removeToast,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
