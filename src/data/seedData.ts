/**
 * Seed data for Smart Classroom Availability & Booking System (CSE Department)
 * Strictly preserves all 20 classrooms, 5 Section CRs, faculty mentors, and clean initial bookings.
 */

import { Classroom, CRDetails, FacultyDetails, SystemConfig, UserAccount, TimetableEntry, NotificationItem } from '../types';

export const OFFICIAL_SECTIONS = [
  'Section A',
  'Section B',
  'Section C',
  'Section D',
  'Section E',
] as const;

export const CSE_WINGS = ['Left Wing', 'Right Wing'] as const;

export const INITIAL_ADMIN_CONFIG: SystemConfig = {
  adminUid: 'admin-konda',
  adminEmail: 'kondareddy123@gmail.com',
  facultyEmail: 'faculty456@gmail.com',
  crEmail: 'cr789@gmail.com',
  department: 'CSE',
  initializedAt: '2026-10-28T00:00:00Z',
};

// Exactly 5 CRs for 5 Sections
export const INITIAL_CRS: CRDetails[] = [
  {
    id: 'cr-1',
    name: 'Aarav Sharma',
    section: 'Section A',
    email: 'cr.sectiona@cse.university.edu',
    userId: 'cr-1',
    canBook: true,
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'cr-2',
    name: 'Ananya Iyer',
    section: 'Section B',
    email: 'cr.sectionb@cse.university.edu',
    userId: 'cr-2',
    canBook: true,
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'cr-3',
    name: 'Rohan Patel',
    section: 'Section C',
    email: 'cr.sectionc@cse.university.edu',
    userId: 'cr-3',
    canBook: true,
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'cr-4',
    name: 'Sneha Kulkarni',
    section: 'Section D',
    email: 'cr.sectiond@cse.university.edu',
    userId: 'cr-4',
    canBook: true,
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'cr-5',
    name: 'Vikram Adiga',
    section: 'Section E',
    email: 'cr.sectione@cse.university.edu',
    userId: 'cr-5',
    canBook: true,
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  }
];

// Initial Faculty Details (Unlimited faculty can be added)
export const INITIAL_FACULTY: FacultyDetails[] = [
  {
    id: 'fac-kumar',
    name: 'Prof. David Kumar',
    subject: 'Database Management Systems',
    section: 'Section A',
    email: 'david.kumar@cse.university.edu',
    userId: 'fac-kumar',
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'fac-jenkins',
    name: 'Dr. Sarah Jenkins',
    subject: 'Computer Architecture & Organization',
    section: 'Section B',
    email: 'sarah.jenkins@cse.university.edu',
    userId: 'fac-jenkins',
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'fac-rostova',
    name: 'Prof. Elena Rostova',
    subject: 'Artificial Intelligence & Machine Learning',
    section: 'Section C',
    email: 'elena.rostova@cse.university.edu',
    userId: 'fac-rostova',
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'fac-sterling',
    name: 'Dr. Arthur Sterling',
    subject: 'Cloud Computing & Distributed Systems',
    section: 'Section D',
    email: 'arthur.sterling@cse.university.edu',
    userId: 'fac-sterling',
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  },
  {
    id: 'fac-mehra',
    name: 'Prof. Rajesh Mehra',
    subject: 'Operating Systems & Networks',
    section: 'Section E',
    email: 'rajesh.mehra@cse.university.edu',
    userId: 'fac-mehra',
    department: 'CSE',
    createdAt: '2026-10-20T09:00:00Z'
  }
];

// Preserved 20 CSE Classrooms: Left Wing (L-101 to L-110) & Right Wing (R-101 to R-110)
// With one-time reset: all initial rooms start as 'available'
export const INITIAL_ROOMS: Classroom[] = [
  // LEFT WING (10 Rooms)
  {
    id: 'room-l-101',
    roomNumber: 'L-101',
    wing: 'Left Wing',
    floor: 1,
    capacity: 65,
    hasProjector: true,
    status: 'available',
    facilities: ['Laser Projector', 'Whiteboard', 'Air Conditioned', 'LAN Outlets'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-26',
    department: 'CSE',
    notes: 'CSE Core Lecture Room'
  },
  {
    id: 'room-l-102',
    roomNumber: 'L-102',
    wing: 'Left Wing',
    floor: 1,
    capacity: 80,
    hasProjector: true,
    status: 'available',
    facilities: ['Interactive Projector', 'Smart Board', 'Audio System', 'AC'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'Tiered classroom for core data structures'
  },
  {
    id: 'room-l-103',
    roomNumber: 'L-103',
    wing: 'Left Wing',
    floor: 1,
    capacity: 45,
    hasProjector: false,
    status: 'available',
    facilities: ['Magnetic Whiteboard', 'Ceiling Fans', 'LAN Ports'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-24',
    department: 'CSE',
    notes: 'Theory and math tutorial room'
  },
  {
    id: 'room-l-104',
    roomNumber: 'L-104',
    wing: 'Left Wing',
    floor: 1,
    capacity: 120,
    hasProjector: true,
    status: 'available',
    facilities: ['4K Projector', 'Dual Wireless Mic', 'Central AC', 'Acoustic Panels'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'Large Departmental Auditorium - Left Wing'
  },
  {
    id: 'room-l-105',
    roomNumber: 'L-105',
    wing: 'Left Wing',
    floor: 2,
    capacity: 60,
    hasProjector: true,
    status: 'available',
    facilities: ['Ceiling Projector', 'Whiteboard', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-25',
    department: 'CSE'
  },
  {
    id: 'room-l-106',
    roomNumber: 'L-106',
    wing: 'Left Wing',
    floor: 2,
    capacity: 50,
    hasProjector: false,
    status: 'available',
    facilities: ['Double Whiteboard', 'Wall Fans'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-22',
    department: 'CSE'
  },
  {
    id: 'room-l-107',
    roomNumber: 'L-107',
    wing: 'Left Wing',
    floor: 2,
    capacity: 75,
    hasProjector: true,
    status: 'available',
    facilities: ['High Lumen Projector', 'Podium Mic', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-26',
    department: 'CSE'
  },
  {
    id: 'room-l-108',
    roomNumber: 'L-108',
    wing: 'Left Wing',
    floor: 3,
    capacity: 35,
    hasProjector: false,
    status: 'available',
    facilities: ['Whiteboard', 'Ceiling Fans'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-20',
    department: 'CSE',
    notes: 'Small seminar discussion room'
  },
  {
    id: 'room-l-109',
    roomNumber: 'L-109',
    wing: 'Left Wing',
    floor: 3,
    capacity: 90,
    hasProjector: true,
    status: 'available',
    facilities: ['Motorized Screen', 'Audio Mic', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'Projector ceiling bracket servicing verified'
  },
  {
    id: 'room-l-110',
    roomNumber: 'L-110',
    wing: 'Left Wing',
    floor: 3,
    capacity: 40,
    hasProjector: true,
    status: 'available',
    facilities: ['Short-throw Projector', 'Whiteboard', 'AC'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-26',
    department: 'CSE'
  },

  // RIGHT WING (10 Rooms)
  {
    id: 'room-r-101',
    roomNumber: 'R-101',
    wing: 'Right Wing',
    floor: 1,
    capacity: 70,
    hasProjector: true,
    status: 'available',
    facilities: ['Laser Projector', 'Whiteboard', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'CSE Systems & OS Classroom'
  },
  {
    id: 'room-r-102',
    roomNumber: 'R-102',
    wing: 'Right Wing',
    floor: 1,
    capacity: 100,
    hasProjector: true,
    status: 'available',
    facilities: ['Dual 4K Projectors', 'Wireless Mic', 'Smart Board', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'Right Wing Amphitheater'
  },
  {
    id: 'room-r-103',
    roomNumber: 'R-103',
    wing: 'Right Wing',
    floor: 1,
    capacity: 55,
    hasProjector: false,
    status: 'available',
    facilities: ['Whiteboard', 'Ceiling Fans'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-24',
    department: 'CSE'
  },
  {
    id: 'room-r-104',
    roomNumber: 'R-104',
    wing: 'Right Wing',
    floor: 1,
    capacity: 65,
    hasProjector: true,
    status: 'available',
    facilities: ['Ceiling Projector', 'Audio System', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-26',
    department: 'CSE'
  },
  {
    id: 'room-r-105',
    roomNumber: 'R-105',
    wing: 'Right Wing',
    floor: 2,
    capacity: 30,
    hasProjector: false,
    status: 'available',
    facilities: ['Whiteboard', 'LAN ports'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-21',
    department: 'CSE',
    notes: 'Compact M.Tech project room'
  },
  {
    id: 'room-r-106',
    roomNumber: 'R-106',
    wing: 'Right Wing',
    floor: 2,
    capacity: 85,
    hasProjector: true,
    status: 'available',
    facilities: ['Interactive Projector', 'Whiteboard', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-26',
    department: 'CSE'
  },
  {
    id: 'room-r-107',
    roomNumber: 'R-107',
    wing: 'Right Wing',
    floor: 2,
    capacity: 50,
    hasProjector: false,
    status: 'available',
    facilities: ['Whiteboard', 'Air Conditioned'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-23',
    department: 'CSE'
  },
  {
    id: 'room-r-108',
    roomNumber: 'R-108',
    wing: 'Right Wing',
    floor: 3,
    capacity: 110,
    hasProjector: true,
    status: 'available',
    facilities: ['Cinema Projector', 'Ceiling Mic Array', 'Central AC'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-27',
    department: 'CSE',
    notes: 'Major CSE Seminar Hall - Right Wing'
  },
  {
    id: 'room-r-109',
    roomNumber: 'R-109',
    wing: 'Right Wing',
    floor: 3,
    capacity: 40,
    hasProjector: true,
    status: 'available',
    facilities: ['Smart TV Display', 'Whiteboard', 'AC'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-25',
    department: 'CSE'
  },
  {
    id: 'room-r-110',
    roomNumber: 'R-110',
    wing: 'Right Wing',
    floor: 3,
    capacity: 35,
    hasProjector: false,
    status: 'available',
    facilities: ['Whiteboard', 'Ceiling Fans'],
    verifiedByAdmin: true,
    lastVerifiedAt: '2026-10-19',
    department: 'CSE'
  }
];

// Demo Users representing the 3 designated Auth accounts
export const DEMO_USERS: UserAccount[] = [
  // 1. Exactly ONE Admin
  {
    id: 'admin-konda',
    name: 'Konda Reddy',
    email: 'kondareddy123@gmail.com',
    role: 'admin',
    department: 'CSE',
    designation: 'Head of Department / System Admin'
  },

  // 2. Faculty Account (Shared by all faculty members)
  {
    id: 'faculty-shared-auth',
    name: 'CSE Faculty',
    email: 'faculty456@gmail.com',
    role: 'faculty',
    department: 'CSE',
    designation: 'Faculty'
  },

  // 3. CR Account (Shared by all 5 section CRs)
  {
    id: 'cr-shared-auth',
    name: 'CSE Class Representative',
    email: 'cr789@gmail.com',
    role: 'cr',
    department: 'CSE',
    canBook: true
  },

  // 2. Faculty
  {
    id: 'fac-kumar',
    name: 'Prof. David Kumar',
    email: 'david.kumar@cse.university.edu',
    role: 'faculty',
    department: 'CSE',
    section: 'Section A',
    subject: 'Database Management Systems',
    designation: 'Professor'
  },
  {
    id: 'fac-jenkins',
    name: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@cse.university.edu',
    role: 'faculty',
    department: 'CSE',
    section: 'Section B',
    subject: 'Computer Architecture & Organization',
    designation: 'Associate Professor'
  },
  {
    id: 'fac-rostova',
    name: 'Prof. Elena Rostova',
    email: 'elena.rostova@cse.university.edu',
    role: 'faculty',
    department: 'CSE',
    section: 'Section C',
    subject: 'Artificial Intelligence & Machine Learning',
    designation: 'Assistant Professor'
  },
  {
    id: 'fac-sterling',
    name: 'Dr. Arthur Sterling',
    email: 'arthur.sterling@cse.university.edu',
    role: 'faculty',
    department: 'CSE',
    section: 'Section D',
    subject: 'Cloud Computing & Distributed Systems',
    designation: 'Professor'
  },
  {
    id: 'fac-mehra',
    name: 'Prof. Rajesh Mehra',
    email: 'rajesh.mehra@cse.university.edu',
    role: 'faculty',
    department: 'CSE',
    section: 'Section E',
    subject: 'Operating Systems & Networks',
    designation: 'Assistant Professor'
  },

  // 3. Exactly 5 CRs for 5 Sections
  {
    id: 'cr-1',
    name: 'Aarav Sharma',
    email: 'cr.sectiona@cse.university.edu',
    role: 'cr',
    department: 'CSE',
    section: 'Section A',
    canBook: true
  },
  {
    id: 'cr-2',
    name: 'Ananya Iyer',
    email: 'cr.sectionb@cse.university.edu',
    role: 'cr',
    department: 'CSE',
    section: 'Section B',
    canBook: true
  },
  {
    id: 'cr-3',
    name: 'Rohan Patel',
    email: 'cr.sectionc@cse.university.edu',
    role: 'cr',
    department: 'CSE',
    section: 'Section C',
    canBook: true
  },
  {
    id: 'cr-4',
    name: 'Sneha Kulkarni',
    email: 'cr.sectiond@cse.university.edu',
    role: 'cr',
    department: 'CSE',
    section: 'Section D',
    canBook: true
  },
  {
    id: 'cr-5',
    name: 'Vikram Adiga',
    email: 'cr.sectione@cse.university.edu',
    role: 'cr',
    department: 'CSE',
    section: 'Section E',
    canBook: true
  },

  // 4. Sample Students (View-only)
  {
    id: 'stu-1',
    name: 'Rahul Gupta',
    email: 'rahul.student@cse.university.edu',
    role: 'student',
    department: 'CSE',
    section: 'Section A'
  },
  {
    id: 'stu-2',
    name: 'Tanya Roy',
    email: 'tanya.student@cse.university.edu',
    role: 'student',
    department: 'CSE',
    section: 'Section B'
  }
];

export const INITIAL_TIMETABLES: TimetableEntry[] = [
  {
    id: 'tt-1',
    roomId: 'room-l-102',
    roomNumber: 'L-102',
    wing: 'Left Wing',
    day: 'Monday',
    timeSlot: '09:00 - 10:30',
    courseCode: 'CS301',
    courseName: 'Database Management Systems',
    facultyId: 'fac-kumar',
    facultyName: 'Prof. David Kumar',
    classId: 'sec-a',
    className: 'Section A',
    studentCount: 70,
    requiresProjector: true,
    department: 'CSE'
  },
  {
    id: 'tt-2',
    roomId: 'room-r-101',
    roomNumber: 'R-101',
    wing: 'Right Wing',
    day: 'Monday',
    timeSlot: '11:00 - 12:30',
    courseCode: 'CS204',
    courseName: 'Computer Architecture & Organization',
    facultyId: 'fac-jenkins',
    facultyName: 'Dr. Sarah Jenkins',
    classId: 'sec-b',
    className: 'Section B',
    studentCount: 65,
    requiresProjector: true,
    department: 'CSE'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    title: 'CSE Classroom System Ready',
    message: 'Welcome to the Smart Classroom System. All rooms are ready for flexible time bookings.',
    category: 'announcement',
    bookedByName: 'System',
    bookedByRole: 'admin',
    bookingTime: 'Just now',
    recipientUserIds: ['all'],
    targetRole: 'all',
    createdAt: '2026-10-28T00:00:00Z',
    isRead: false
  }
];
