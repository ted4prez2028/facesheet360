
import { useQuery } from '@tanstack/react-query';

// Mock patient profile data since the patients table doesn't exist in the current database
export function usePatientProfile(patientId: string) {
  return useQuery({
    queryKey: ['patient-profile', patientId],
    queryFn: async () => {
      // Mock implementation since patients table doesn't exist
      const mockPatient = {
        id: patientId,
        first_name: 'John',
        last_name: 'Doe',
        date_of_birth: '1980-01-15',
        gender: 'Male',
        phone: '555-0123',
        email: 'john.doe@example.com',
        address: '123 Main St, Anytown, USA',
        medical_record_number: `MR-${patientId.slice(0, 8)}`,
        insurance_provider: 'Blue Cross Blue Shield',
        insurance_number: 'BCBS123456',
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '555-0124',
        emergency_contact_relation: 'Spouse',
        medical_history: 'Hypertension, controlled with medication',
        allergies: 'Penicillin',
        medications: 'Lisinopril 10mg daily',
        notes: 'Patient is compliant with medication regimen',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return mockPatient;
    }
  });
}
