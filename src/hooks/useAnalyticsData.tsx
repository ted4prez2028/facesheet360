
import { useState, useEffect } from 'react';
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

// Export the hook and the specific hooks used in Analytics page
export const usePatientStatistics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['patientStatistics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data, error } = await supabase
        .from('patients')
        .select('created_at')
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      
      // Process data for patient statistics
      const processedData = processTimeSeriesData(data.map(item => item.created_at), timeframe);
      return processedData.map(item => ({
        ...item,
        newPatients: Math.floor(item.count * 0.7) // Simulated new patients data
      }));
    }
  });
};

export const useAppointmentStatistics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['appointmentStatistics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date, status')
        .gte('appointment_date', startDate.toISOString());
      
      if (error) throw error;
      
      // Group by date and status
      const dateMap = new Map();
      data.forEach(item => {
        const dateKey = timeframe === 'week' 
          ? new Date(item.appointment_date).toISOString().split('T')[0]
          : `${new Date(item.appointment_date).getFullYear()}-${String(new Date(item.appointment_date).getMonth() + 1).padStart(2, '0')}`;
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey, completed: 0, scheduled: 0, cancelled: 0 });
        }
        
        const entry = dateMap.get(dateKey);
        if (item.status === 'completed') entry.completed++;
        else if (item.status === 'scheduled') entry.scheduled++;
        else if (item.status === 'cancelled') entry.cancelled++;
      });
      
      return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    }
  });
};

export const usePatientDemographics = () => {
  return useQuery({
    queryKey: ['patientDemographics'],
    queryFn: async () => {
      // In a real application, this would fetch from your database
      // Returning mock data for now
      return [
        { ageGroup: '0-17', male: 45, female: 42, other: 3 },
        { ageGroup: '18-30', male: 78, female: 82, other: 5 },
        { ageGroup: '31-45', male: 105, female: 98, other: 8 },
        { ageGroup: '46-60', male: 120, female: 125, other: 6 },
        { ageGroup: '61+', male: 95, female: 102, other: 4 }
      ];
    }
  });
};

export const useCareCoinsAnalytics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['careCoinsAnalytics', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data, error } = await supabase
        .from('care_coins_transactions')
        .select('created_at, amount, transaction_type')
        .gte('created_at', startDate.toISOString());
      
      if (error) throw error;
      
      // Group by date and transaction type
      const dateMap = new Map();
      data.forEach(item => {
        const dateKey = timeframe === 'week' 
          ? new Date(item.created_at).toISOString().split('T')[0]
          : `${new Date(item.created_at).getFullYear()}-${String(new Date(item.created_at).getMonth() + 1).padStart(2, '0')}`;
        
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, { date: dateKey, earned: 0, spent: 0 });
        }
        
        const entry = dateMap.get(dateKey);
        if (item.transaction_type === 'reward') {
          entry.earned += item.amount;
        } else if (item.transaction_type === 'purchase') {
          entry.spent += item.amount;
        }
      });
      
      return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    }
  });
};

// Original useAnalyticsData hook
export const useAnalyticsData = (timeframe: string = 'year') => {
  // Query for patient visits over time
  const { data: patientVisits, isLoading: isVisitsLoading } = useQuery({
    queryKey: ['analytics', 'patient-visits', timeframe],
    queryFn: async () => {
      const startDate = getStartDateForTimeframe(timeframe);
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_date')
        .gte('appointment_date', startDate.toISOString())
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      // Process data into a format suitable for charts
      return processTimeSeriesData(data.map(item => item.appointment_date), timeframe);
    }
  });

  // Query for key metrics
  const { data: keyMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['analytics', 'key-metrics', timeframe],
    queryFn: async () => {
      // This would typically come from multiple queries aggregated together
      // For now, returning mock data
      return [
        {
          title: 'Total Patients',
          value: 1254,
          change: 12.5,
          trend: 'up' as const
        },
        {
          title: 'Appointments',
          value: 542,
          change: 8.2,
          trend: 'up' as const
        },
        {
          title: 'Avg Visit Duration',
          value: 32,
          change: -2.1,
          trend: 'down' as const
        },
        {
          title: 'Care Plan Adherence',
          value: 86,
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

// Helper function to get start date based on timeframe
function getStartDateForTimeframe(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'quarter':
      return new Date(now.setMonth(now.getMonth() - 3));
    case 'year':
    default:
      return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}

// Helper function to process time series data
function processTimeSeriesData(dates: string[], timeframe: string): AnalyticsDataPoint[] {
  const dateMap = new Map<string, number>();
  const format = timeframe === 'week' ? 'yyyy-MM-dd' : 'yyyy-MM';

  // Initialize with zero counts
  const startDate = getStartDateForTimeframe(timeframe);
  const now = new Date();
  let current = new Date(startDate);
  
  while (current <= now) {
    const key = timeframe === 'week' 
      ? current.toISOString().split('T')[0] 
      : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    
    dateMap.set(key, 0);
    
    if (timeframe === 'week') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  // Count actual appointments
  dates.forEach(dateStr => {
    const date = new Date(dateStr);
    const key = timeframe === 'week'
      ? date.toISOString().split('T')[0]
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (dateMap.has(key)) {
      dateMap.set(key, dateMap.get(key)! + 1);
    }
  });
  
  // Convert map to array
  return Array.from(dateMap).map(([date, count]) => ({
    date,
    count
  })).sort((a, b) => a.date.localeCompare(b.date));
}

export default useAnalyticsData;
