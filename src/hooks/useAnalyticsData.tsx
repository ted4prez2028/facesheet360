
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Types for analytics data
export interface AnalyticsData {
  patientTrends: {
    month: string;
    newPatients: number;
    activePatients: number;
    discharge: number;
  }[];
  appointmentData: {
    month: string;
    scheduled: number;
    completed: number;
    cancelled: number;
  }[];
  patientDemographics: {
    name: string;
    value: number;
  }[];
  diagnosisData: {
    name: string;
    value: number;
  }[];
  providerPerformance: {
    name: string;
    [provider: string]: string | number;
  }[];
  careCoinsData: {
    month: string;
    earned: number;
    spent: number;
  }[];
  overviewStats: {
    totalPatients: number;
    appointments: number;
    chartingRate: number;
    careCoinsGenerated: number;
    patientsGrowth: number;
    appointmentsGrowth: number;
    chartingRateGrowth: number;
    careCoinsGrowth: number;
  };
}

// Function to fetch analytics data from Supabase
const fetchAnalyticsData = async (userId: string, timeframe: string): Promise<AnalyticsData> => {
  try {
    // Get patient trends data - new and active patients per month
    const { data: patientTrendsData, error: patientTrendsError } = await supabase
      .rpc('get_patient_trends', { timeframe_param: timeframe });
    
    if (patientTrendsError) throw patientTrendsError;

    // Get appointment data - scheduled, completed, cancelled
    const { data: appointmentData, error: appointmentError } = await supabase
      .rpc('get_appointment_analytics', { 
        timeframe_param: timeframe, 
        provider_id_param: userId 
      });
    
    if (appointmentError) throw appointmentError;

    // Get patient demographics - age distribution
    const { data: patientDemographicsData, error: demographicsError } = await supabase
      .rpc('get_patient_demographics');
    
    if (demographicsError) throw demographicsError;

    // Get common diagnoses data
    const { data: diagnosisData, error: diagnosisError } = await supabase
      .rpc('get_common_diagnoses');
    
    if (diagnosisError) throw diagnosisError;

    // Get provider performance data
    const { data: providerPerformanceData, error: performanceError } = await supabase
      .rpc('get_provider_performance');
    
    if (performanceError) throw performanceError;

    // Get CareCoins data
    const { data: careCoinsData, error: careCoinsError } = await supabase
      .rpc('get_care_coins_analytics', { 
        user_id_param: userId, 
        timeframe_param: timeframe 
      });
    
    if (careCoinsError) throw careCoinsError;

    // Get overview statistics
    const { data: overviewStatsData, error: overviewError } = await supabase
      .rpc('get_analytics_overview', { 
        provider_id_param: userId, 
        timeframe_param: timeframe 
      });
    
    if (overviewError) throw overviewError;
    
    const overviewStats = overviewStatsData && overviewStatsData.length > 0 
      ? overviewStatsData[0] 
      : {
          totalPatients: 0,
          appointments: 0,
          chartingRate: 0,
          careCoinsGenerated: 0,
          patientsGrowth: 0,
          appointmentsGrowth: 0,
          chartingRateGrowth: 0,
          careCoinsGrowth: 0
        };

    // Return the full analytics data object
    return {
      patientTrends: patientTrendsData || [],
      appointmentData: appointmentData || [],
      patientDemographics: patientDemographicsData || [],
      diagnosisData: diagnosisData || [],
      providerPerformance: providerPerformanceData || [],
      careCoinsData: careCoinsData || [],
      overviewStats: overviewStats
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    toast.error("Failed to load analytics data");
    // Return empty data in case of error
    return {
      patientTrends: [],
      appointmentData: [],
      patientDemographics: [],
      diagnosisData: [],
      providerPerformance: [],
      careCoinsData: [],
      overviewStats: {
        totalPatients: 0,
        appointments: 0,
        chartingRate: 0,
        careCoinsGenerated: 0,
        patientsGrowth: 0,
        appointmentsGrowth: 0,
        chartingRateGrowth: 0,
        careCoinsGrowth: 0
      }
    };
  }
};

// Hook to fetch analytics data
export const useAnalyticsData = (timeframe: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["analyticsData", user?.id, timeframe],
    queryFn: () => fetchAnalyticsData(user?.id || "", timeframe),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
