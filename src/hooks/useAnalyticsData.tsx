
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type TimeframeType = 'week' | 'month' | 'quarter' | 'year';

export function usePatientStatistics(timeframe: TimeframeType = 'year') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patientStatistics', timeframe],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_patient_trends', { timeframe_param: timeframe });

        if (error) {
          throw new Error(`Error fetching patient statistics: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in usePatientStatistics:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useAppointmentStatistics(timeframe: TimeframeType = 'year', providerId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['appointmentStatistics', timeframe, providerId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_appointment_analytics', { 
            timeframe_param: timeframe,
            provider_id_param: providerId || null 
          });

        if (error) {
          throw new Error(`Error fetching appointment statistics: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in useAppointmentStatistics:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function usePatientDemographics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patientDemographics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_patient_demographics');

        if (error) {
          throw new Error(`Error fetching patient demographics: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in usePatientDemographics:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useCommonDiagnoses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['commonDiagnoses'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_common_diagnoses');

        if (error) {
          throw new Error(`Error fetching common diagnoses: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in useCommonDiagnoses:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useProviderPerformance() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['providerPerformance'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_provider_performance');

        if (error) {
          throw new Error(`Error fetching provider performance: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in useProviderPerformance:', error);
        return [];
      }
    },
    enabled: !!user,
  });
}

export function useCareCoinsAnalytics(timeframe: TimeframeType = 'year', userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['careCoinsAnalytics', timeframe, targetUserId],
    queryFn: async () => {
      try {
        if (!targetUserId) return [];
        
        const { data, error } = await supabase
          .rpc('get_care_coins_analytics', { 
            user_id_param: targetUserId,
            timeframe_param: timeframe 
          });

        if (error) {
          throw new Error(`Error fetching care coins analytics: ${error.message}`);
        }

        return data;
      } catch (error) {
        console.error('Error in useCareCoinsAnalytics:', error);
        return [];
      }
    },
    enabled: !!user && !!targetUserId,
  });
}

export function useAnalyticsOverview(timeframe: TimeframeType = 'year', providerId?: string) {
  const { user } = useAuth();
  const targetUserId = providerId || user?.id;

  return useQuery({
    queryKey: ['analyticsOverview', timeframe, targetUserId],
    queryFn: async () => {
      try {
        if (!targetUserId) return null;
        
        const { data, error } = await supabase
          .rpc('get_analytics_overview', { 
            provider_id_param: targetUserId,
            timeframe_param: timeframe 
          });

        if (error) {
          throw new Error(`Error fetching analytics overview: ${error.message}`);
        }

        // Ensure we have data and it's the first record
        if (data && data.length > 0) {
          return {
            totalPatients: data[0].totalpatients,
            appointments: data[0].appointments,
            chartingRate: data[0].chartingrate,
            careCoinsGenerated: data[0].carecoinsgenerated,
            patientsGrowth: data[0].patientsgrowth,
            appointmentsGrowth: data[0].appointmentsgrowth,
            chartingRateGrowth: data[0].chartingrategrowth,
            careCoinsGrowth: data[0].carecoinsgrowth
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error in useAnalyticsOverview:', error);
        return null;
      }
    },
    enabled: !!user && !!targetUserId,
  });
}
