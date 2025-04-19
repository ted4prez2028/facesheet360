
import { useState, useMemo } from 'react';
import { startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';

export const useAppointmentDates = (initialDate: Date = new Date()) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [weekStart, setWeekStart] = useState(startOfWeek(initialDate, { weekStartsOn: 1 }));

  const weekDays = useMemo(() => {
    const end = endOfWeek(weekStart, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end });
  }, [weekStart]);

  const navigateToNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };

  const navigateToPreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  return {
    currentDate,
    weekStart,
    weekDays,
    navigateToNextWeek,
    navigateToPreviousWeek,
    navigateToToday
  };
};
