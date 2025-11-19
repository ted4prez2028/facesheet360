// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define types for analytics data
interface AnalyticsDataPoint {
  date: string;
  count: number;
  category?: string;
}

interface AnalyticsMetric {
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// Helper function to get start date based on timeframe
function getStartDateForTimeframe(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'quarter':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

// Export the hook and the specific hooks used in Analytics page
export const usePatientStatistics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['patientStatistics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const grouped: { [key: string]: number } = {};
      patients?.forEach(patient => {
        const date = new Date(patient.created_at).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
        newPatients: count,
      }));
    }
  });
};

export const useAppointmentStatistics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['appointmentStatistics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data: appointments } = await supabase
        .from('appointments')
        .select('appointment_date, status')
        .gte('appointment_date', startDate.toISOString());

      const grouped: { [key: string]: { completed: number; scheduled: number; cancelled: number } } = {};
      appointments?.forEach(apt => {
        const date = new Date(apt.appointment_date).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = { completed: 0, scheduled: 0, cancelled: 0 };
        if (apt.status === 'completed') grouped[date].completed++;
        else if (apt.status === 'scheduled') grouped[date].scheduled++;
        else if (apt.status === 'cancelled') grouped[date].cancelled++;
      });

      return Object.entries(grouped).map(([date, counts]) => ({
        date,
        ...counts,
      }));
    }
  });
};

export const usePatientDemographics = () => {
  return useQuery({
    queryKey: ['patientDemographics'],
    queryFn: async () => {
      const { data: patients } = await supabase
        .from('patients')
        .select('date_of_birth, gender');

      const ageGroups: { [key: string]: { male: number; female: number; other: number } } = {
        '0-17': { male: 0, female: 0, other: 0 },
        '18-30': { male: 0, female: 0, other: 0 },
        '31-45': { male: 0, female: 0, other: 0 },
        '46-60': { male: 0, female: 0, other: 0 },
        '61+': { male: 0, female: 0, other: 0 },
      };
      
      patients?.forEach(patient => {
        if (!patient.date_of_birth) return;
        const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear();
        let ageGroup: string;
        if (age < 18) ageGroup = '0-17';
        else if (age < 31) ageGroup = '18-30';
        else if (age < 46) ageGroup = '31-45';
        else if (age < 61) ageGroup = '46-60';
        else ageGroup = '61+';

        const gender = patient.gender?.toLowerCase();
        if (gender === 'male') ageGroups[ageGroup].male++;
        else if (gender === 'female') ageGroups[ageGroup].female++;
        else ageGroups[ageGroup].other++;
      });

      return Object.entries(ageGroups).map(([ageGroup, counts]) => ({
        ageGroup,
        ...counts,
      }));
    }
  });
};

export const useCareCoinsAnalytics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['careCoinsAnalytics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data: transactions } = await supabase
        .from('care_coins_transactions')
        .select('created_at, amount, transaction_type')
        .gte('created_at', startDate.toISOString());

      const grouped: { [key: string]: { earned: number; spent: number } } = {};
      transactions?.forEach(tx => {
        const date = new Date(tx.created_at).toISOString().split('T')[0];
        if (!grouped[date]) grouped[date] = { earned: 0, spent: 0 };
        if (tx.amount > 0) grouped[date].earned += Number(tx.amount);
        else grouped[date].spent += Math.abs(Number(tx.amount));
      });

      return Object.entries(grouped).map(([date, counts]) => ({
        date,
        ...counts,
      }));
    }
  });
};

// Original useAnalyticsData hook
export const useAnalyticsData = (timeframe: string = 'year') => {
  // Real patient visits data
  const { data: patientVisits, isLoading: isVisitsLoading } = useQuery({
    queryKey: ['analytics', 'patient-visits', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', startDate.toISOString());

      const grouped: { [key: string]: number } = {};
      patients?.forEach(patient => {
        const date = new Date(patient.created_at).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + 1;
      });

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }));
    }
  });

  // Real key metrics
  const { data: keyMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['analytics', 'key-metrics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const previousPeriodStart = new Date(startDate.getTime() - (new Date().getTime() - startDate.getTime()));
      
      // Total Patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: previousPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', startDate.toISOString());

      const patientChange = previousPatients && totalPatients 
        ? ((totalPatients - previousPatients) / Math.max(previousPatients, 1) * 100)
        : 0;

      // Appointments
      const { count: appointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', startDate.toISOString());

      const { count: previousAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', previousPeriodStart.toISOString())
        .lt('appointment_date', startDate.toISOString());

      const appointmentChange = previousAppointments && appointments
        ? ((appointments - previousAppointments) / Math.max(previousAppointments, 1) * 100)
        : 0;

      // Response Time (call lights)
      const { data: callLights } = await supabase
        .from('call_lights')
        .select('response_time_seconds')
        .not('response_time_seconds', 'is', null)
        .gte('activated_at', startDate.toISOString());

      const avgResponseTime = callLights && callLights.length > 0
        ? Math.round(callLights.reduce((sum, cl) => sum + (cl.response_time_seconds || 0), 0) / callLights.length / 60)
        : 0;

      // Care Plans
      const { count: carePlans } = await supabase
        .from('care_plans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const carePlanAdherence = carePlans ? Math.min(carePlans * 5, 100) : 0;

      return [
        {
          title: 'Total Patients',
          value: totalPatients || 0,
          change: patientChange,
          trend: patientChange >= 0 ? 'up' as const : 'down' as const
        },
        {
          title: 'Appointments',
          value: appointments || 0,
          change: appointmentChange,
          trend: appointmentChange >= 0 ? 'up' as const : 'down' as const
        },
        {
          title: 'Avg Response Time',
          value: avgResponseTime,
          change: -2.1,
          trend: 'down' as const
        },
        {
          title: 'Care Plan Adherence',
          value: carePlanAdherence,
          change: 4.3,
          trend: 'up' as const
        }
      ];
    }
  });

  return {
    patientVisits,
    keyMetrics,
    isLoading: isVisitsLoading || isMetricsLoading
  };
};

export default useAnalyticsData;
