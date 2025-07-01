
import { useQuery } from '@tanstack/react-query';
import { RecentPatient, TodayAppointment, PendingTask } from '@/types';

export const useMockRecentPatients = () => {
  return useQuery({
    queryKey: ['mock-recent-patients'],
    queryFn: (): RecentPatient[] => [
      {
        id: '1',
        name: 'John Doe',
        lastVisit: '2024-01-15',
        age: 45,
        condition: 'Hypertension'
      },
      {
        id: '2',
        name: 'Jane Smith',
        lastVisit: '2024-01-14',
        age: 32,
        condition: 'Diabetes'
      }
    ]
  });
};

export const useMockTodayAppointments = () => {
  return useQuery({
    queryKey: ['mock-today-appointments'],
    queryFn: (): TodayAppointment[] => [
      {
        id: '1',
        time: '09:00',
        patient: 'John Doe',
        type: 'Check-up',
        duration: 30
      },
      {
        id: '2',
        time: '10:30',
        patient: 'Jane Smith',
        type: 'Follow-up',
        duration: 45
      }
    ]
  });
};

export const useMockPendingTasks = () => {
  return useQuery({
    queryKey: ['mock-pending-tasks'],
    queryFn: (): PendingTask[] => [
      {
        id: '1',
        task: 'Review lab results for John Doe',
        priority: 'high' as const,
        due: '2024-01-16'
      },
      {
        id: '2',
        task: 'Schedule follow-up for Jane Smith',
        priority: 'medium' as const,
        due: '2024-01-17'
      }
    ]
  });
};
