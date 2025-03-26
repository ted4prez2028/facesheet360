
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types";

export const getPatientAppointments = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .order("appointment_date", { ascending: true });

    if (error) throw error;
    return data as Appointment[];
  } catch (error) {
    console.error(`Error fetching appointments for patient ${patientId}:`, error);
    throw error;
  }
};

export const addAppointment = async (appointment: Partial<Appointment>) => {
  try {
    if (!appointment.patient_id || !appointment.provider_id || !appointment.appointment_date || !appointment.status) {
      throw new Error("Missing required appointment fields");
    }
    
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: appointment.patient_id,
        provider_id: appointment.provider_id,
        appointment_date: appointment.appointment_date,
        status: appointment.status,
        notes: appointment.notes
      })
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

export const updateAppointment = async (id: string, data: Partial<Appointment>) => {
  const { appointment_date, patient_id, provider_id, status, ...rest } = data;
  
  const updateData: any = { ...rest };
  if (appointment_date) {
    updateData.appointment_date = appointment_date;
  }
  if (patient_id) {
    updateData.patient_id = patient_id;
  }
  if (provider_id) {
    updateData.provider_id = provider_id;
  }
  if (status) {
    updateData.status = status;
  }
  
  const { data: updatedAppointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updatedAppointment;
};
