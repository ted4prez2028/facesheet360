
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

export const usePatient = (patientId?: string) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!patientId) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;

      // Transform data to match Patient interface
      const transformedPatient: Patient = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: data.address,
        medical_record_number: data.medical_record_number,
        insurance_provider: data.insurance_provider,
        insurance_number: data.insurance_number,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        allergies: data.allergies,
        medications: data.medications,
        medical_history: data.medical_history,
        notes: data.notes,
        facial_data: data.facial_data,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      };

      setPatient(transformedPatient);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId, fetchPatient]);

  const updatePatient = async (updates: Partial<Patient>) => {
    if (!patientId || !patient) return;

    try {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', patientId)
        .select()
        .single();

      if (error) throw error;

      // Transform updated data
      const transformedPatient: Patient = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        address: data.address,
        medical_record_number: data.medical_record_number,
        insurance_provider: data.insurance_provider,
        insurance_number: data.insurance_number,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_contact_relation: data.emergency_contact_relation,
        allergies: data.allergies,
        medications: data.medications,
        medical_history: data.medical_history,
        notes: data.notes,
        facial_data: data.facial_data,
        user_id: data.user_id,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at
      };

      setPatient(transformedPatient);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return {
    patient,
    isLoading,
    error,
    updatePatient,
    refetch: fetchPatient
  };
};
