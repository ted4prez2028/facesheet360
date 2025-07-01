
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

// This API bypasses RLS by using direct queries
// It still requires authentication but doesn't rely on RLS policies

export const getPatientsDirect = async () => {
  try {
    // First verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required");
    }
    
    // Use direct query instead of RPC since function doesn't exist
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Direct patient query error:", error);
      throw error;
    }
    
    return data as Patient[];
  } catch (error) {
    console.error("Error in direct patient query:", error);
    throw error;
  }
};

export const getPatientByIdDirect = async (patientId: string) => {
  try {
    // First verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required");
    }
    
    // Use direct query instead of edge function
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (error) {
      console.error("Direct patient fetch error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error("Patient not found");
    }
    
    return data as Patient;
  } catch (error) {
    console.error(`Error in direct patient fetch for ID ${patientId}:`, error);
    throw error;
  }
};

export const addPatientDirect = async (patient: Partial<Patient>) => {
  try {
    // First verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required");
    }
    
    // Validate required fields
    if (!patient.first_name || !patient.last_name || !patient.date_of_birth || !patient.gender) {
      throw new Error("Missing required patient fields");
    }
    
    // Use direct insert instead of RPC
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        email: patient.email || null,
        phone: patient.phone || null,
        address: patient.address || null,
        medical_record_number: patient.medical_record_number || null,
        insurance_provider: patient.insurance_provider || null,
        insurance_number: patient.insurance_number || null,
        facial_data: patient.facial_data || null
      })
      .select()
      .single();
    
    if (error) {
      console.error("Direct patient insert error:", error);
      throw error;
    }
    
    return data as Patient;
  } catch (error) {
    console.error("Error in direct patient insert:", error);
    throw error;
  }
};
