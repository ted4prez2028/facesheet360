
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Appointment {
  id?: string;
  patient_id: string;
  provider_id: string;
  appointment_date: string; // Changed from Date | string to only string
  status: string;
  notes?: string;
}

// Get all appointments
export const getAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, first_name, last_name, medical_record_number),
        users!provider_id(id, name, email, role)
      `)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Get appointments for a specific patient
export const getPatientAppointments = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients(id, first_name, last_name, medical_record_number),
        users!provider_id(id, name, email, role)
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    throw error;
  }
};

// Get appointments for today
export const getTodayAppointments = async (providerId?: string) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfToday = new Date(today.setHours(23, 59, 59, 999)).toISOString();
  
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients(id, first_name, last_name, medical_record_number),
      users!provider_id(id, name, email, role)
    `)
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

// Add a new appointment
export const addAppointment = async (appointment: Appointment) => {
  try {
    // Ensure appointment_date is a string (convert if it's a Date object)
    const formattedAppointment = {
      ...appointment,
      appointment_date: typeof appointment.appointment_date === 'object' 
        ? appointment.appointment_date.toISOString() 
        : appointment.appointment_date
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(formattedAppointment)
      .select(`
        *,
        patients(id, first_name, last_name, medical_record_number),
        users!provider_id(id, name, email, role)
      `)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

// Update an existing appointment
export const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  try {
    // Format the appointment_date if it exists and is a Date object
    const formattedUpdates = {
      ...updates,
      appointment_date: updates.appointment_date && typeof updates.appointment_date === 'object' 
        ? updates.appointment_date.toISOString() 
        : updates.appointment_date
    };
    
    const { data, error } = await supabase
      .from('appointments')
      .update(formattedUpdates)
      .eq('id', id)
      .select(`
        *,
        patients(id, first_name, last_name, medical_record_number),
        users!provider_id(id, name, email, role)
      `)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating appointment ${id}:`, error);
    throw error;
  }
};

// Delete an appointment
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
