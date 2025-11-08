import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Appointment {
  id?: string;
  patient_id: string;
  provider_id: string;
  scheduled_time: string;
  appointment_type: string;
  status: string;
  notes?: string;
  duration_minutes?: number;
}

export const getAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, medical_record_number)
      `)
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

export const getPatientAppointments = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, name, medical_record_number)
      `)
      .eq('patient_id', patientId)
      .order('scheduled_time', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    throw error;
  }
};

export const getTodayAppointments = async (providerId?: string) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(id, name, medical_record_number)
    `)
    .gte('scheduled_time', startOfToday)
    .lte('scheduled_time', endOfToday);
  
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }
  
  try {
    const { data, error } = await query.order('scheduled_time', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    throw error;
  }
};

export const addAppointment = async (appointment: Appointment) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment] as any)
      .select(`
        *,
        patients(id, name, medical_record_number)
      `)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        patients(id, name, medical_record_number)
      `)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};

export const deleteAppointment = async (id: string) => {
  try {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting appointment ${id}:`, error);
    throw error;
  }
};
