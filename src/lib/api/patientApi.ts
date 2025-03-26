
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

// Patient functions
export const getPatients = async () => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to view patients.");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    return data as Patient[];
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const getPatientById = async (id: string) => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to view patient details.");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Patient;
  } catch (error) {
    console.error(`Error fetching patient with ID ${id}:`, error);
    throw error;
  }
};

export const addPatient = async (patient: Partial<Patient>) => {
  try {
    if (!patient.first_name || !patient.last_name || !patient.date_of_birth || !patient.gender) {
      throw new Error("Missing required patient fields");
    }
    
    // Check that the auth session exists first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to add patients.");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .insert({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        medical_record_number: patient.medical_record_number,
        insurance_provider: patient.insurance_provider,
        policy_number: patient.policy_number,
        facial_data: patient.facial_data
      })
      .select()
      .single();

    if (error) {
      if (error.code === '42P17') {
        console.error("RLS policy error adding patient:", error);
        throw new Error("Database permission error. Please ensure you're logged in with the correct credentials.");
      }
      throw error;
    }
    return data as Patient;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

export const updatePatient = async (id: string, data: Partial<Patient>) => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to update patient details.");
    }
    
    const { date_of_birth, ...rest } = data;
    
    const updateData: any = { ...rest };
    if (date_of_birth) {
      updateData.date_of_birth = date_of_birth;
    }
    
    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedPatient;
  } catch (error) {
    console.error(`Error updating patient with ID ${id}:`, error);
    throw error;
  }
};

export const deletePatient = async (id: string) => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to delete patients.");
    }
    
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error);
    throw error;
  }
};

// Patient Identification by Facial Data
export const getPatientByFacialData = async () => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to use facial recognition.");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .not("facial_data", "is", null);

    if (error) throw error;
    
    return data as Patient[];
  } catch (error) {
    console.error("Error fetching patients with facial data:", error);
    throw error;
  }
};

export const storeFacialData = async (patientId: string, facialData: string) => {
  try {
    // Check for valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to store facial data.");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .update({ facial_data: facialData })
      .eq("id", patientId)
      .select()
      .single();

    if (error) throw error;
    return data as Patient;
  } catch (error) {
    console.error("Error storing facial data:", error);
    throw error;
  }
};

// Alias for getPatientById to maintain compatibility
export const getPatient = async (id: string) => {
  return getPatientById(id);
};

// Alias for addPatient to maintain compatibility
export const createPatient = async (patient: Partial<Patient>) => {
  return addPatient(patient);
};
