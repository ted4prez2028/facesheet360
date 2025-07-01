
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface DbPatientStatistic {
  month: string;
  newpatients: number;
  activepatients: number;
}

interface DbVitalSign {
  date_recorded: string;
  heart_rate?: number;
  blood_pressure?: string;
  oxygen_saturation?: number;
}

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
        // Mock data since the database tables don't exist
        const mockStatistics: PatientStatistic[] = [
          { name: "Jan", newPatients: 12, activePatients: 45, avg: 28 },
          { name: "Feb", newPatients: 15, activePatients: 52, avg: 33 },
          { name: "Mar", newPatients: 18, activePatients: 48, avg: 33 },
          { name: "Apr", newPatients: 22, activePatients: 61, avg: 41 },
          { name: "May", newPatients: 25, activePatients: 58, avg: 41 },
          { name: "Jun", newPatients: 20, activePatients: 55, avg: 37 }
        ];
        
        return mockStatistics;
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
        // Mock data since vital_signs table doesn't exist
        return defaultHealthMetrics;
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
