
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
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
          .from('patients')
          .select('created_at')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Process data by month
        const monthlyData: { [key: string]: number } = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        data.forEach(patient => {
          const date = new Date(patient.created_at);
          const monthKey = months[date.getMonth()];
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        return months.slice(0, 6).map(month => ({
          name: month,
          newPatients: monthlyData[month] || 0,
          activePatients: (monthlyData[month] || 0) * 3 + 20, // Simulated active patients
          avg: Math.round(((monthlyData[month] || 0) + 20) / 2)
        }));
      } catch (error) {
        console.error("Error fetching patient statistics:", error);
        toast.error("Failed to load patient statistics");
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePatientHealthMetrics = (patientId?: string) => {
  return useQuery({
    queryKey: ['healthMetrics', patientId],
    queryFn: async (): Promise<HealthMetric[]> => {
      if (!patientId) {
        return defaultHealthMetrics;
      }

      try {
        const { data, error } = await supabase
          .from('vital_signs')
          .select('*')
          .eq('patient_id', patientId)
          .order('date_recorded', { ascending: false })
          .limit(6);

        if (error) throw error;

        if (!data || data.length === 0) {
          return defaultHealthMetrics;
        }

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map((month, index) => {
          const vitalData = data[index];
          return {
            name: month,
            heartRate: vitalData?.heart_rate || 75,
            bloodPressure: parseInt(vitalData?.blood_pressure?.split('/')[0] || '120'),
            o2Saturation: vitalData?.oxygen_saturation || 98
          };
        });
      } catch (error) {
        console.error("Error fetching patient health metrics:", error);
        toast.error("Failed to load health metrics");
        return defaultHealthMetrics;
      }
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

const defaultHealthMetrics: HealthMetric[] = [
  { name: "Jan", heartRate: 75, bloodPressure: 120, o2Saturation: 98 },
  { name: "Feb", heartRate: 72, bloodPressure: 118, o2Saturation: 97 },
  { name: "Mar", heartRate: 78, bloodPressure: 125, o2Saturation: 99 },
  { name: "Apr", heartRate: 74, bloodPressure: 115, o2Saturation: 98 },
  { name: "May", heartRate: 76, bloodPressure: 122, o2Saturation: 97 },
  { name: "Jun", heartRate: 73, bloodPressure: 119, o2Saturation: 98 }
];

export default usePatientStatistics;
