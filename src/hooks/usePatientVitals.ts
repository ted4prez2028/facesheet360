
import { useQuery } from '@tanstack/react-query';

// Mock patient vitals data since the vital_signs table doesn't exist
export function usePatientVitals(patientId: string) {
  return useQuery({
    queryKey: ['patient-vitals', patientId],
    queryFn: async () => {
      // Mock implementation since vital_signs table doesn't exist
      const mockVitals = {
        id: `vitals-${patientId}`,
        patient_id: patientId,
        date_recorded: new Date().toISOString(),
        heart_rate: 72,
        blood_pressure: '120/80',
        temperature: 98.6,
        oxygen_saturation: 98,
        respiratory_rate: 16,
        weight: 180,
        height: 70,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockVitals;
    }
  });
}
