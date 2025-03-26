
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

// This API bypasses RLS by using direct SQL for patient operations
// It still requires authentication but doesn't rely on RLS policies

export const getPatientsDirect = async () => {
  try {
    // First verify authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required");
    }
    
    // Use RPC for direct SQL execution with the custom function
    const { data, error } = await supabase.rpc('get_all_patients');
    
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
    
    // Use RPC for direct SQL execution with the patient data
    const { data, error } = await supabase.rpc('add_patient', {
      p_first_name: patient.first_name,
      p_last_name: patient.last_name,
      p_date_of_birth: patient.date_of_birth,
      p_gender: patient.gender,
      p_email: patient.email || null,
      p_phone: patient.phone || null,
      p_address: patient.address || null,
      p_medical_record_number: patient.medical_record_number || null,
      p_insurance_provider: patient.insurance_provider || null,
      p_policy_number: patient.policy_number || null,
      p_facial_data: patient.facial_data || null
    });
    
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
