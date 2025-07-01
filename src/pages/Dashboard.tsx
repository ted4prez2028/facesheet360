
import React from 'react';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentPatients from '@/components/dashboard/RecentPatients';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import PendingTasks from '@/components/dashboard/PendingTasks';
import QuickActions from '@/components/dashboard/QuickActions';
import { useAppointmentsToday } from '@/hooks/useAppointmentsToday';
import { usePendingTasks } from '@/hooks/usePendingTasks';
import { useRecentPatients } from '@/hooks/useRecentPatients';

const mockData = {
  totalPatients: 120,
  totalAppointments: 30,
  completedTasks: 15,
  pendingTasks: 5,
  todayAppointments: [
    {
      id: '1',
      time: '9:00 AM',
      patient: 'John Doe',
      type: 'Checkup',
      duration: 30,
    },
    {
      id: '2',
      time: '10:30 AM',
      patient: 'Jane Smith',
      type: 'Follow-up',
      duration: 60,
    },
  ],
  pendingTasksList: [
    {
      id: '1',
      task: 'Review lab results',
      priority: 'high' as const,
      due: 'Today',
    },
    {
      id: '2',
      task: 'Schedule follow-up',
      priority: 'medium' as const,
      due: 'Tomorrow',
    },
  ],
  recentPatients: [
    {
      id: '1',
      name: 'John Doe',
      lastVisit: 'Yesterday',
      age: 45,
      condition: 'Hypertension',
      status: 'stable',
    },
    {
      id: '2',
      name: 'Jane Smith',
      lastVisit: '2 days ago',
      age: 32,
      condition: 'Diabetes',
      status: 'stable',
    },
  ],
};

export default function Dashboard() {
  const appointments = useAppointmentsToday();
  const pendingTasks = usePendingTasks();
  const recentPatients = useRecentPatients();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <QuickActions />
        </div>
      </div>

      <StatisticsCards
        totalPatients={mockData.totalPatients}
        totalAppointments={mockData.totalAppointments}
        completedTasks={mockData.completedTasks}
        pendingTasks={mockData.pendingTasks}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts 
            patientStatistics={{
              totalPatients: mockData.totalPatients,
              newPatients: 12,
              activePatients: 108
            }}
            healthMetrics={{
              averageVitals: 95,
              riskPatients: 5,
              improvementRate: 78
            }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodayAppointments appointments={mockData.todayAppointments} />
            <PendingTasks tasks={mockData.pendingTasksList} />
          </div>
        </div>

        <div className="space-y-6">
          <RecentPatients patients={mockData.recentPatients} />
        </div>
      </div>
    </div>
  );
}
