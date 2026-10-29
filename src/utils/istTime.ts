/**
 * IST (India Standard Time, UTC+5:30) Date and Time Utilities
 * All booking, availability, and scheduling calculations strictly adhere to IST.
 */

// IST offset from UTC in milliseconds: 5 hours 30 minutes = 19,800,000 ms
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Returns a Date object representing the current moment shifted to IST wall-clock time
 */
export function getISTNow(): Date {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utcMs + IST_OFFSET_MS);
}

/**
 * Returns current IST date as YYYY-MM-DD string
 */
export function getISTDateString(d: Date = getISTNow()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current IST time as HH:mm string (24-hour)
 */
export function getISTTimeString(d: Date = getISTNow()): string {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a Date or IST string into human readable IST format
 */
export function formatISTDisplay(d: Date = getISTNow()): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return d.toLocaleString('en-IN', options);
}

/**
 * Validates if the selected date and start time is in the past according to IST
 */
export function isTimeInPastIST(dateStr: string, timeStr: string): boolean {
  const istDateStr = getISTDateString();
  const istTimeStr = getISTTimeString();

  if (dateStr < istDateStr) {
    return true;
  }
  if (dateStr === istDateStr && timeStr < istTimeStr) {
    return true;
  }
  return false;
}

/**
 * Checks if a booking's end time has passed in IST
 */
export function isBookingExpiredIST(dateStr: string, endTimeStr: string): boolean {
  const istDateStr = getISTDateString();
  const istTimeStr = getISTTimeString();

  if (dateStr < istDateStr) {
    return true;
  }
  if (dateStr === istDateStr && endTimeStr <= istTimeStr) {
    return true;
  }
  return false;
}

/**
 * Checks if current IST time falls strictly inside [startTime, endTime) on dateStr
 */
export function isBookingActiveNowIST(dateStr: string, startTimeStr: string, endTimeStr: string, status?: string): boolean {
  if (status === 'Cancelled') return false;

  const istDateStr = getISTDateString();
  if (dateStr !== istDateStr) return false;

  const istTimeStr = getISTTimeString();
  return istTimeStr >= startTimeStr && istTimeStr < endTimeStr;
}

export interface OverlapBookingTarget {
  id?: string;
  roomNumber: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Confirmed' | 'Cancelled';
  bookedByName?: string;
  section?: string;
}

/**
 * Core Overlap Check Rule:
 * Two bookings on the same room and same date overlap if:
 * newStart < existingEnd AND newEnd > existingStart
 * (Ignoring cancelled or expired bookings)
 */
export function checkBookingOverlap(
  existing: OverlapBookingTarget,
  newBooking: {
    id?: string;
    roomNumber: string;
    date: string;
    startTime: string;
    endTime: string;
  }
): boolean {
  // If different room or different date, no overlap
  if (existing.roomNumber !== newBooking.roomNumber) return false;
  if (existing.date !== newBooking.date) return false;

  // Ignore self when updating
  if (existing.id && newBooking.id && existing.id === newBooking.id) return false;

  // Ignore cancelled bookings
  if (existing.status === 'Cancelled') return false;

  // Ignore expired bookings (past IST)
  if (isBookingExpiredIST(existing.date, existing.endTime)) return false;

  // Check overlap condition:
  // Overlap exists if: newStart < existingEnd AND newEnd > existingStart
  return newBooking.startTime < existing.endTime && newBooking.endTime > existing.startTime;
}

/**
 * Formats 24h HH:mm to 12h with AM/PM for friendly display
 */
export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${h}:${m} ${ampm}`;
}
