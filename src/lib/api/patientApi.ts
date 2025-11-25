import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";
import { handleSupabaseError, createAppError, ErrorCode } from "@/utils/errorHandler";
import { logPatientView, logPatientCreate, logPatientUpdate, logPatientDelete } from "@/lib/auditLogger";

// Helper function to check if user is authenticated without triggering RLS recursion
const ensureAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Auth error:", error);
    throw new Error(`Authentication error: ${error.message}`);
  }
  
  if (!data.session) {
    throw new Error("Authentication required. Please log in to continue.");
  }
  
  return data.session;
};

// Patient functions with direct authentication checks
export const getPatients = async () => {
  try {
    // Check for valid session first
    await ensureAuthenticated();
    
    // Use service key for patients query to bypass RLS
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      throw handleSupabaseError(error, 'getPatients');
    }
    return data as Patient[];
  } catch (error) {
    throw handleSupabaseError(error, 'getPatients');
  }
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  try {
    // Verify authentication first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      throw createAppError(
        'Authentication required',
        ErrorCode.AUTHENTICATION_ERROR,
        { userMessage: 'Please log in to view patient information' }
      );
    }
    
    // Try the direct query first
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw handleSupabaseError(error, 'getPatientById');
    }
    
    // Log HIPAA audit event for patient record access
    if (data) {
      await logPatientView(id, data.name || `${data.first_name} ${data.last_name}`);
    }
    
    return data as Patient;
  } catch (error) {
    throw handleSupabaseError(error, 'getPatientById');
  }
};

export const addPatient = async (patient: Partial<Patient>) => {
  try {
    // Validate required fields
    if (!patient.first_name || !patient.last_name || !patient.date_of_birth || !patient.gender) {
      throw new Error("Missing required patient fields");
    }
    
    // Verify authentication
    const session = await ensureAuthenticated();
    console.log("User authenticated with ID:", session.user.id);
    
    // Insert the patient record
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
        room_number: patient.room_number,
        medical_record_number: patient.medical_record_number,
        insurance_provider: patient.insurance_provider,
        insurance_policy_number: patient.policy_number || patient.insurance_number,
        facial_data: patient.facial_data,
        user_id: session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Database error adding patient:", error);
      
      // Handle specific error types
      if (error.code === '42P17' || error.message.includes('infinite recursion')) {
        throw new Error("Database permission issue. Please try again or contact support.");
      }
      
      if (error.code === '42501' || error.message.includes('permission denied')) {
        throw new Error("Permission denied. You may not have the necessary access rights.");
      }
      
      throw error;
    }
    
    // Log HIPAA audit event for patient creation
    if (data) {
      await logPatientCreate(data.id, {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender
      });
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
    
    interface PatientUpdate extends Partial<Patient> {
      date_of_birth?: string;
    }

    const updateData: PatientUpdate = { ...rest };
    if (date_of_birth) {
      updateData.date_of_birth = date_of_birth;
    }
    
    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      // If RLS policy error, provide a clearer message
      if (error.code === '42P17' || error.message.includes('infinite recursion')) {
        throw new Error("Database permission issue. This appears to be a configuration problem with the database security rules.");
      }
      throw error;
    }
    
    // Log HIPAA audit event for patient update
    if (updatedPatient) {
      await logPatientUpdate(
        id, 
        updateData, 
        updatedPatient.name || `${updatedPatient.first_name} ${updatedPatient.last_name}`
      );
    }
    
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
    
    // Get patient name before deletion for audit log
    const { data: patient } = await supabase
      .from("patients")
      .select("first_name, last_name, name")
      .eq("id", id)
      .single();
    
    const patientName = patient?.name || `${patient?.first_name} ${patient?.last_name}`;
    
    // Log HIPAA audit event BEFORE deletion
    await logPatientDelete(id, patientName);
    
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
