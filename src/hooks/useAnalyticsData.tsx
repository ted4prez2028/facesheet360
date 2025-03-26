
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OverviewData {
  totalPatients: number;
  appointments: number;
  chartingRate: number;
  careCoinsGenerated: number;
  patientsGrowth: number;
  appointmentsGrowth: number;
  chartingRateGrowth: number;
  careCoinsGrowth: number;
}

interface MonthlyTrendData {
  month: string;
  newPatients: number;
  activePatients: number;
  discharge: number;
}

interface PatientsByDemographicData {
  category: string;
  value: number;
}

interface ChartingRateData {
  date: string;
  rate: number;
}

interface AnalyticsData {
  overview: OverviewData;
  monthlyTrends: MonthlyTrendData[];
  patientsByAge: PatientsByDemographicData[];
  patientsByGender: PatientsByDemographicData[];
  chartingRate: ChartingRateData[];
  isLoading: boolean;
  error: Error | null;
}

export function useAnalyticsData() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    overview: {
      totalPatients: 0,
      appointments: 0,
      chartingRate: 0,
      careCoinsGenerated: 0,
      patientsGrowth: 0,
      appointmentsGrowth: 0,
      chartingRateGrowth: 0,
      careCoinsGrowth: 0
    },
    monthlyTrends: [],
    patientsByAge: [],
    patientsByGender: [],
    chartingRate: [],
    isLoading: true,
    error: null
  });

  // Fetch analytics data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch overview stats
        const { data: overviewData, error: overviewError } = await supabase
          .rpc('get_analytics_overview');
        
        if (overviewError) throw overviewError;
        
        // Fetch monthly trends
        const { data: monthlyData, error: monthlyError } = await supabase
          .rpc('get_monthly_trends');
        
        if (monthlyError) throw monthlyError;
        
        // Fetch patients by age
        const { data: ageData, error: ageError } = await supabase
          .rpc('get_patients_by_age');
        
        if (ageError) throw ageError;
        
        // Fetch patients by gender
        const { data: genderData, error: genderError } = await supabase
          .rpc('get_patients_by_gender');
        
        if (genderError) throw genderError;
        
        // Fetch charting rate
        const { data: chartingData, error: chartingError } = await supabase
          .rpc('get_charting_rate');
        
        if (chartingError) throw chartingError;
        
        // Transform the data
        const transformedAgeData = ageData.map((item: any) => ({
          category: item.age_group,
          value: item.count
        }));
        
        const transformedGenderData = genderData.map((item: any) => ({
          category: item.gender || 'Unknown',
          value: item.count
        }));
        
        const transformedChartingData = chartingData.map((item: any) => ({
          date: item.date,
          rate: item.rate
        }));
        
        // Map monthly trends to expected schema
        const transformedMonthlyData = monthlyData.map((item: any) => ({
          month: item.month,
          newPatients: item.newpatients,
          activePatients: item.activepatients,
          discharge: item.discharge
        }));
        
        // Format overview data
        const transformedOverviewData = {
          totalPatients: overviewData.totalpatients,
          appointments: overviewData.appointments,
          chartingRate: overviewData.chartingrate,
          careCoinsGenerated: overviewData.carecoinsgenerated,
          patientsGrowth: overviewData.patientsgrowth,
          appointmentsGrowth: overviewData.appointmentsgrowth,
          chartingRateGrowth: overviewData.chartingrategrowth,
          careCoinsGrowth: overviewData.carecoinsgrowth
        };
        
        setAnalyticsData({
          overview: transformedOverviewData,
          monthlyTrends: transformedMonthlyData,
          patientsByAge: transformedAgeData,
          patientsByGender: transformedGenderData,
          chartingRate: transformedChartingData,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        setAnalyticsData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error(String(error))
        }));
      }
    };

    fetchData();
  }, []);

  return analyticsData;
}
