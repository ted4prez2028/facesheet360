import { supabase } from "@/integrations/supabase/client";

export interface PatientAssignment {
  id?: string;
  patient_id: string;
  assigned_to: string;
  role: 'doctor' | 'nurse' | 'therapist' | 'cna';
  assigned_at?: string;
  assigned_by?: string;
  notes?: string;
}

export const getPatientAssignments = async (patientId: string) => {
  const { data, error } = await supabase
    .from('patient_assignments')
    .select(`
      *,
      users:assigned_to(id, name, email, role)
    `)
    .eq('patient_id', patientId)
    .order('assigned_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createPatientAssignment = async (assignment: Omit<PatientAssignment, 'id'>) => {
  const { data, error } = await supabase
    .from('patient_assignments')
    .insert(assignment)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePatientAssignment = async (id: string) => {
  const { error } = await supabase
    .from('patient_assignments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const getUsersByRole = async (role?: string) => {
  let query = supabase
    .from('users')
    .select('id, name, email, role')
    .order('name');

  if (role) {
    query = query.eq('role', role);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
