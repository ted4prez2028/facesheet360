
import { format, startOfToday, endOfToday, addDays, subDays, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

/**
 * Get formatted date range for current week
 */
export const getCurrentWeekRange = (weekStart: Date) => {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return {
    start: format(weekStart, "MMM d"),
    end: format(weekEnd, "MMM d, yyyy")
  };
};

/**
 * Get ISO string for start of day
 */
export const getStartOfDayISO = (date: Date = new Date()): string => {
  return new Date(date.setHours(0, 0, 0, 0)).toISOString();
};

/**
 * Get ISO string for end of day
 */
export const getEndOfDayISO = (date: Date = new Date()): string => {
  return new Date(date.setHours(23, 59, 59, 999)).toISOString();
};

/**
 * Format a date for display on UI
 */
export const formatAppointmentDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, "PPp"); // e.g. Apr 20, 2023, 10:00 AM
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateStr;
  }
};

/**
 * Format a time slot for the calendar
 */
export const formatTimeSlot = (hour: number): string => {
  return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
};

/**
 * Get week navigation functions for the calendar
 */
export const getWeekNavigation = (weekStart: Date, setWeekStart: React.Dispatch<React.SetStateAction<Date>>) => {
  return {
    handlePreviousWeek: () => setWeekStart(subWeeks(weekStart, 1)),
    handleNextWeek: () => setWeekStart(addWeeks(weekStart, 1)),
    handleToday: () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 })),
  };
};

/**
 * Get available time slots for scheduling
 */
export const getAvailableTimeSlots = () => {
  return Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
};
