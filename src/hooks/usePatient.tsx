
import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { toast } from 'sonner';
import { useRolePermissions } from './useRolePermissions';

export const usePatient = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { hasRole, isAssignedToPatient } = useRolePermissions();

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Attempting to fetch patient with ID:", patientId);
        
        // Since we don't have a real patients table, we'll create mock data
        const mockPatient: Patient = {
          id: patientId,
          first_name: 'John',
          last_name: 'Doe',
          name: 'John Doe',
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
          age: 44,
          status: 'Active',
          lastVisit: new Date().toISOString(),
          imgUrl: null,
          created_at: new Date().toISOString(),
          provider_id: 'mock-provider-id'
        };
        
        setPatient(mockPatient);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch patient"));
        
        // Display a user-friendly error message
        toast.error("Unable to load patient data. Using mock data instead.");
        
        // Set mock data as fallback
        const fallbackPatient: Patient = {
          id: patientId,
          first_name: 'Unknown',
          last_name: 'Patient',
          name: 'Unknown Patient',
          date_of_birth: '1990-01-01',
          gender: 'Not specified',
          phone: 'Not provided',
          email: 'Not provided',
          address: 'Not provided',
          medical_record_number: `MR-${patientId.slice(0, 8)}`,
          insurance_provider: 'Not provided',
          insurance_number: 'Not provided',
          emergency_contact_name: 'Not provided',
          emergency_contact_phone: 'Not provided',
          emergency_contact_relation: 'Not provided',
          medical_history: 'Not available',
          allergies: 'Not available',
          medications: 'Not available',
          notes: 'Not available',
          age: 0,
          status: 'Unknown',
          lastVisit: new Date().toISOString(),
          imgUrl: null,
          created_at: new Date().toISOString(),
          provider_id: 'mock-provider-id'
        };
        
        setPatient(fallbackPatient);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId, hasRole, isAssignedToPatient]);

  return { patient, isLoading, error };
};
