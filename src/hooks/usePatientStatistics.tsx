
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PatientStatistic {
  name: string;
  newPatients: number;
  activePatients: number;
  avg: number;
}

export interface HealthMetric {
  name: string;
  heartRate: number;
  bloodPressure: number;
  o2Saturation: number;
}

export const usePatientStatistics = (timeframe: string = 'year') => {
  return useQuery({
    queryKey: ['patientStatistics', timeframe],
    queryFn: async (): Promise<PatientStatistic[]> => {
      try {
        const { data, error } = await supabase
          .rpc('get_patient_trends', { timeframe_param: timeframe });
        
        if (error) throw error;
        
        return data.map((item: any) => ({
          name: item.month,
          newPatients: item.newpatients,
          activePatients: item.activepatients,
          avg: Math.floor((item.newpatients + item.activepatients) / 2)
        }));
      } catch (error) {
        console.error("Error fetching patient statistics:", error);
        toast.error("Failed to load patient statistics");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatientHealthMetrics = (patientId?: string) => {
  return useQuery({
    queryKey: ['healthMetrics', patientId],
    queryFn: async (): Promise<HealthMetric[]> => {
      if (!patientId) {
        // Return sample data if no patient is selected
        return defaultHealthMetrics;
      }

      try {
        // Get the last 6 months of vital signs for this patient
        const { data: vitalSignsData, error: vitalSignsError } = await supabase
          .from('vital_signs')
          .select('*')
          .eq('patient_id', patientId)
          .order('date_recorded', { ascending: false })
          .limit(6);
        
        if (vitalSignsError) throw vitalSignsError;
        
        if (!vitalSignsData || vitalSignsData.length === 0) {
          return defaultHealthMetrics;
        }
        
        // Convert to the format needed for charts
        return vitalSignsData.map((item: any) => {
          const date = new Date(item.date_recorded);
          return {
            name: date.toLocaleString('default', { month: 'short' }),
            heartRate: item.heart_rate || 0,
            bloodPressure: item.blood_pressure 
              ? parseInt(item.blood_pressure.split('/')[0]) 
              : 0,
            o2Saturation: item.oxygen_saturation || 0
          };
        }).reverse();
      } catch (error) {
        console.error("Error fetching patient health metrics:", error);
        toast.error("Failed to load health metrics");
        return defaultHealthMetrics;
      }
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Default health metrics data for fallback
const defaultHealthMetrics: HealthMetric[] = [
  { name: "Jan", heartRate: 75, bloodPressure: 120, o2Saturation: 98 },
  { name: "Feb", heartRate: 72, bloodPressure: 118, o2Saturation: 97 },
  { name: "Mar", heartRate: 78, bloodPressure: 125, o2Saturation: 99 },
  { name: "Apr", heartRate: 74, bloodPressure: 115, o2Saturation: 98 },
  { name: "May", heartRate: 76, bloodPressure: 122, o2Saturation: 97 },
  { name: "Jun", heartRate: 73, bloodPressure: 119, o2Saturation: 98 }
];

export default usePatientStatistics;
