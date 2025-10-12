
import React from 'react';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { PageHeader } from '@/components/common/PageHeader';
import { useAppointmentsToday } from '@/hooks/useAppointmentsToday';
import { usePendingTasks } from '@/hooks/usePendingTasks';
import { useRecentPatients } from '@/hooks/useRecentPatients';

export default function Dashboard() {
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointmentsToday();
  const { data: pendingTasks = [], isLoading: tasksLoading } = usePendingTasks();
  const { data: recentPatients = [], isLoading: patientsLoading } = useRecentPatients();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your healthcare overview."
        showEncryption={true}
      />

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
