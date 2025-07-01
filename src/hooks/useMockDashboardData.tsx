
import { useQuery } from '@tanstack/react-query';
import { RecentPatient, TodayAppointment, PendingTask } from '@/types';

export const useMockRecentPatients = () => {
  return useQuery({
    queryKey: ['mock-recent-patients'],
    queryFn: (): RecentPatient[] => [
      {
        id: '1',
        name: 'John Smith',
        lastVisit: '2024-01-15',
        age: 45,
        condition: 'Hypertension',
        status: 'stable'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        lastVisit: '2024-01-14',
        age: 32,
        condition: 'Diabetes',
        status: 'monitoring'
      },
      {
        id: '3',
        name: 'Michael Brown',
        lastVisit: '2024-01-13',
        age: 67,
        condition: 'Heart Disease',
        status: 'critical'
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
        time: '09:00 AM',
        patient: 'Alice Wilson',
        type: 'Check-up',
        duration: 30
      },
      {
        id: '2',
        time: '10:30 AM',
        patient: 'Robert Davis',
        type: 'Follow-up',
        duration: 45
      },
      {
        id: '3',
        time: '02:00 PM',
        patient: 'Emma Martinez',
        type: 'Consultation',
        duration: 60
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
        task: 'Review lab results for John Smith',
        priority: 'high',
        due: '2024-01-16'
      },
      {
        id: '2',
        task: 'Update medication list for Sarah Johnson',
        priority: 'medium',
        due: '2024-01-17'
      },
      {
        id: '3',
        task: 'Schedule follow-up for Michael Brown',
        priority: 'low',
        due: '2024-01-20'
      }
    ]
  });
};
