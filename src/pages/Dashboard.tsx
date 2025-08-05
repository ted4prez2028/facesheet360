
import React from 'react';
import StatisticsCards from '@/components/dashboard/StatisticsCards';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import RecentPatients from '@/components/dashboard/RecentPatients';
import TodayAppointments from '@/components/dashboard/TodayAppointments';
import PendingTasks from '@/components/dashboard/PendingTasks';
import { useAppointmentsToday } from '@/hooks/useAppointmentsToday';
import { usePendingTasks } from '@/hooks/usePendingTasks';
import { useRecentPatients } from '@/hooks/useRecentPatients';

export default function Dashboard() {
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsToday();
  const { data: pendingTasks = [], isLoading: tasksLoading } = usePendingTasks();
  const { data: recentPatients = [], isLoading: patientsLoading } = useRecentPatients();

  // Mock data for charts (to be replaced with real data later)
  const mockPatientStatistics = [
    { name: 'Jan', newPatients: 12, activePatients: 108 },
    { name: 'Feb', newPatients: 15, activePatients: 115 },
    { name: 'Mar', newPatients: 18, activePatients: 125 },
  ];

  const mockHealthMetrics = [
    { name: 'Heart Rate', heartRate: 72, bloodPressure: 120 },
    { name: 'Blood Pressure', heartRate: 75, bloodPressure: 118 },
    { name: 'Temperature', heartRate: 70, bloodPressure: 122 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <StatisticsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DashboardCharts 
            patientStatistics={mockPatientStatistics}
            healthMetrics={mockHealthMetrics}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodayAppointments appointments={appointments} isLoading={appointmentsLoading} />
            <PendingTasks tasks={pendingTasks} isLoading={tasksLoading} />
          </div>
        </div>

        <div className="space-y-6">
          <RecentPatients patients={recentPatients} isLoading={patientsLoading} />
        </div>
      </div>
    </div>
  );
}
