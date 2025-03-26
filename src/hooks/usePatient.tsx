
import { useState, useEffect } from 'react';
import { getPatientById } from '@/lib/supabaseApi';
import { Patient } from '@/types';

export const usePatient = (patientId: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getPatientById(patientId);
        setPatient(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching patient:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch patient"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  return { patient, isLoading, error };
};
