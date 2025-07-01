
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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
      // Mock data since patients table doesn't exist in current schema
      const mockData = generateMockTimeSeriesData(timeframe);
      return mockData.map(item => ({
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
      // Mock data since appointments table doesn't exist in current schema
      return generateMockAppointmentData(timeframe);
    }
  });
};

export const usePatientDemographics = () => {
  return useQuery({
    queryKey: ['patientDemographics'],
    queryFn: async () => {
      // Mock demographic data
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
      // Mock data since care_coins_transactions table doesn't exist in current schema
      return generateMockCareCoinsData(timeframe);
    }
  });
};

// Original useAnalyticsData hook
export const useAnalyticsData = (timeframe: string = 'year') => {
  // Mock patient visits data
  const { data: patientVisits, isLoading: isVisitsLoading } = useQuery({
    queryKey: ['analytics', 'patient-visits', timeframe],
    queryFn: async () => {
      return generateMockTimeSeriesData(timeframe);
    }
  });

  // Mock key metrics
  const { data: keyMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['analytics', 'key-metrics', timeframe],
    queryFn: async () => {
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

// Helper function to generate mock time series data
function generateMockTimeSeriesData(timeframe: string): AnalyticsDataPoint[] {
  const data: AnalyticsDataPoint[] = [];
  const startDate = getStartDateForTimeframe(timeframe);
  const now = new Date();
  const current = new Date(startDate);
  
  while (current <= now) {
    const key = timeframe === 'week' 
      ? current.toISOString().split('T')[0] 
      : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    
    data.push({
      date: key,
      count: Math.floor(Math.random() * 50) + 10 // Random count between 10-60
    });
    
    if (timeframe === 'week') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to generate mock appointment data
function generateMockAppointmentData(timeframe: string) {
  const data = [];
  const startDate = getStartDateForTimeframe(timeframe);
  const now = new Date();
  const current = new Date(startDate);
  
  while (current <= now) {
    const key = timeframe === 'week' 
      ? current.toISOString().split('T')[0] 
      : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    
    data.push({
      date: key,
      completed: Math.floor(Math.random() * 20) + 5,
      scheduled: Math.floor(Math.random() * 15) + 3,
      cancelled: Math.floor(Math.random() * 5) + 1
    });
    
    if (timeframe === 'week') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

// Helper function to generate mock care coins data
function generateMockCareCoinsData(timeframe: string) {
  const data = [];
  const startDate = getStartDateForTimeframe(timeframe);
  const now = new Date();
  const current = new Date(startDate);
  
  while (current <= now) {
    const key = timeframe === 'week' 
      ? current.toISOString().split('T')[0] 
      : `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    
    data.push({
      date: key,
      earned: Math.floor(Math.random() * 500) + 100,
      spent: Math.floor(Math.random() * 300) + 50
    });
    
    if (timeframe === 'week') {
      current.setDate(current.getDate() + 1);
    } else {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

export default useAnalyticsData;
