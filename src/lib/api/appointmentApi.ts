import { supabase } from "@/integrations/supabase/client";

// Reusable column selection for appointment queries.  The previous
// implementation attempted to join the `users` table using the
// `provider_id` field, but the database lacks a foreign-key relationship
// between the two tables.  That join produced 400 errors from Supabase.
//
// By centralising the select string and limiting it to explicit
// appointment fields plus the related patient record, we ensure the
// client never requests the unsupported `users!provider_id` join again.
// Selecting columns explicitly avoids any implicit relationship
// expansions that might sneak back into the query.
const APPOINTMENT_SELECT = `id,
  patient_id,
  provider_id,
  appointment_date,
  status,
  notes,
  patients(id, first_name, last_name, medical_record_number)`;

export interface Appointment {
  id?: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string;
  status: string;
  notes?: string;
}

export const getAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .order('appointment_date', { ascending: true });

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
      .select(APPOINTMENT_SELECT)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true });

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
    .select(APPOINTMENT_SELECT)
    .gte('appointment_date', startOfToday)
    .lte('appointment_date', endOfToday);
  
  if (providerId) {
    query = query.eq('provider_id', providerId);
  }
  
  try {
    const { data, error } = await query.order('appointment_date', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    throw error;
  }
};

export const addAppointment = async (appointment: Appointment) => {
  try {
    const formattedAppointment = {
      ...appointment,
      appointment_date: appointment.appointment_date
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(formattedAppointment)
      .select(APPOINTMENT_SELECT)
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
    const formattedUpdates = {
      ...updates,
      appointment_date: updates.appointment_date || undefined
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .update(formattedUpdates)
      .eq('id', id)
      .select(APPOINTMENT_SELECT)
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
