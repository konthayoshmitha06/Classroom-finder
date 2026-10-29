/**
 * Type definitions for Smart Classroom Availability & Booking System (CSE Department)
 */

export type UserRole = 'admin' | 'faculty' | 'cr' | 'student';

export type WingType = 'Left Wing' | 'Right Wing';

export type ClassroomStatus = 'available' | 'Booked' | 'occupied' | 'maintenance';

export interface Classroom {
  id: string;
  roomNumber: string;
  wing: WingType;
  floor: number;
  capacity: number;
  hasProjector: boolean;
  status: 'available' | 'occupied' | 'maintenance';
  facilities: string[];
  department: 'CSE';
  verifiedByAdmin?: boolean;
  lastVerifiedAt?: string;
  notes?: string;
  currentOccupant?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: 'CSE';
  section?: string;
  subject?: string;
  designation?: string;
  canBook?: boolean;
}

// Exactly 5 CRs for 5 Sections
export interface CRDetails {
  id: string;
  name: string;
  section: string; // Section A, Section B, Section C, Section D, Section E
  email?: string;
  userId?: string;
  canBook: boolean;
  department: 'CSE';
  createdAt?: string;
}

// Unlimited Faculty Details
export interface FacultyDetails {
  id: string;
  name: string;
  subject: string;
  section: string;
  email?: string;
  userId?: string;
  department: 'CSE';
  createdAt?: string;
}

export type BookingStatus = 'Confirmed' | 'Cancelled';

export interface Booking {
  id: string;
  roomNumber: string;
  roomId?: string;
  section: string;
  date: string;       // YYYY-MM-DD (IST)
  startTime: string;  // HH:mm (IST)
  endTime: string;    // HH:mm (IST)
  bookedBy: string;   // Firebase Auth UID
  personId: string;   // Registered CR or Faculty ID who is booking
  personName: string; // Registered CR or Faculty Name
  bookedByName?: string; // Display fallback
  role: UserRole;
  status: BookingStatus;
  createdAt: string;  // ISO timestamp
  purpose?: string;
  studentCount?: number;
  requiresProjector?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  department?: 'CSE';
}

export interface TimetableEntry {
  id: string;
  roomId: string;
  roomNumber: string;
  wing: WingType;
  day: string;
  timeSlot: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  classId: string;
  className: string;
  studentCount?: number;
  requiresProjector?: boolean;
  department?: 'CSE';
}

export interface DayOfWeekSchedule {
  day: string;
  timeSlot: string;
  roomNumber: string;
  courseCode: string;
  facultyName: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'booking' | 'cancellation' | 'room_change' | 'maintenance' | 'announcement';
  roomId?: string;
  roomNumber?: string;
  wing?: WingType;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeSlot?: string;
  purpose?: string;
  section?: string;
  bookedByName: string;
  bookedByRole: string;
  bookingTime: string;
  recipientUserIds: string[];
  targetRole?: 'all' | 'faculty' | 'cr';
  createdAt: string;
  isRead: boolean;
}

export interface SystemConfig {
  adminUid: string;
  adminEmail: string;
  facultyEmail: string;
  crEmail: string;
  department: 'CSE';
  initializedAt: string;
}
