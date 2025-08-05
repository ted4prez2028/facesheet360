
import React from 'react';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { useAppointmentsToday } from '@/hooks/useAppointmentsToday';
import { usePendingTasks } from '@/hooks/usePendingTasks';
import { useRecentPatients } from '@/hooks/useRecentPatients';

export default function Dashboard() {
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsToday();
  const { data: pendingTasks = [], isLoading: tasksLoading } = usePendingTasks();
  const { data: recentPatients = [], isLoading: patientsLoading } = useRecentPatients();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <DashboardTabs 
        recentPatients={recentPatients}
        todayAppointments={appointments}
        pendingTasks={pendingTasks}
        isRecentPatientsLoading={patientsLoading}
        isAppointmentsLoading={appointmentsLoading}
        isTasksLoading={tasksLoading}
      />
    </div>
  );
}
