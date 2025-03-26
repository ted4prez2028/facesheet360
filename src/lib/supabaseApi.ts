
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Patient } from "@/types";

// User management
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    if (!data) {
      console.log("No user profile found for ID:", userId);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    // Map the user fields to match the database column names
    const dbUpdates: Record<string, any> = {};
    
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.specialty) dbUpdates.specialty = updates.specialty;
    if (updates.licenseNumber) dbUpdates.license_number = updates.licenseNumber;
    if (updates.profileImage) dbUpdates.profile_image = updates.profileImage;
    if (updates.walletAddress) dbUpdates.wallet_address = updates.walletAddress;
    
    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    toast.error("Error updating user profile");
    throw error;
  }
};

// Patient management
export const getPatients = async (filters: Record<string, any> = {}) => {
  try {
    let query = supabase.from('patients').select('*');
    
    // Apply any filters if needed
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.ilike(key, `%${value}%`);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Error fetching patients");
    throw error;
  }
};

export const getPatientById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    toast.error("Error fetching patient");
    throw error;
  }
};

export const createPatient = async (patientData: Partial<Patient>) => {
  try {
    // Ensure required fields exist
    if (!patientData.first_name || !patientData.last_name || !patientData.gender) {
      throw new Error("Missing required patient information");
    }
    
    // Ensure date_of_birth is provided or derived from age
    if (!patientData.date_of_birth && patientData.age) {
      const today = new Date();
      today.setFullYear(today.getFullYear() - patientData.age);
      patientData.date_of_birth = today.toISOString().split('T')[0];
    } else if (!patientData.date_of_birth) {
      throw new Error("Either date_of_birth or age must be provided");
    }
    
    const { data, error } = await supabase
      .from('patients')
      .insert({
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        date_of_birth: patientData.date_of_birth,
        gender: patientData.gender,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        medical_record_number: patientData.medical_record_number,
        insurance_provider: patientData.insurance_provider,
        policy_number: patientData.policy_number,
        facial_data: patientData.facial_data
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating patient:", error);
    toast.error("Error creating patient");
    throw error;
  }
};

export const updatePatient = async (id: string, patientData: Partial<Patient>) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating patient:", error);
    toast.error("Error updating patient");
    throw error;
  }
};

// Appointment management
export const getAppointments = async (filters = {}) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patients(first_name, last_name),
        users(name)
      `);
    
    // Apply any filters if needed
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error("Error fetching appointments");
    throw error;
  }
};

export const createAppointment = async (appointmentData: any) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating appointment:", error);
    toast.error("Error creating appointment");
    throw error;
  }
};

// Chart records
export const getChartRecords = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .select(`
        *,
        users(name)
      `)
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching chart records:", error);
    toast.error("Error fetching chart records");
    throw error;
  }
};

export const createChartEntry = async (chartData: any) => {
  try {
    const { data, error } = await supabase
      .from('chart_records')
      .insert(chartData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating chart entry:", error);
    toast.error("Error creating chart entry");
    throw error;
  }
};

// CareCoins functions
export const getCareCoinsBalance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('care_coins_balance')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    
    return data?.care_coins_balance || 0;
  } catch (error) {
    console.error("Error fetching CareCoins balance:", error);
    toast.error("Error fetching CareCoins balance");
    return 0;
  }
};

export const getCareCoinsTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('care_coins_transactions')
      .select(`
        *,
        from_user:from_user_id(name),
        to_user:to_user_id(name)
      `)
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching CareCoins transactions:", error);
    toast.error("Error fetching CareCoins transactions");
    throw error;
  }
};

export const transferCareCoins = async (fromUserId: string, toUserId: string, amount: number, description: string) => {
  try {
    // Start a transaction
    const { error } = await supabase.rpc('transfer_care_coins', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_amount: amount,
      p_description: description
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error transferring CareCoins:", error);
    toast.error("Error transferring CareCoins");
    throw error;
  }
};

export const updateWalletAddress = async (userId: string, walletAddress: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating wallet address:", error);
    toast.error("Error updating wallet address");
    throw error;
  }
};

// For facial recognition
export const storeFacialData = async (patientId: string, facialData: string) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({ facial_data: facialData })
      .eq('id', patientId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error storing facial data:", error);
    toast.error("Error storing facial data");
    return null;
  }
};

export const getPatientByFacialData = async (facialData: string) => {
  try {
    const descriptor = await extractFaceDescriptor(facialData);
    if (!descriptor) {
      throw new Error("No face detected in the image");
    }
    
    // Call the edge function for facial recognition
    const { data, error } = await supabase.functions.invoke('facial-recognition', {
      body: { 
        action: 'identify', 
        faceDescriptor: descriptor 
      }
    });
    
    if (error) throw error;
    
    if (!data.success) {
      return null;
    }
    
    return data.patient;
  } catch (error) {
    console.error("Error recognizing face:", error);
    toast.error("Error recognizing face");
    throw error;
  }
};

// Helper function to extract face descriptor from image
const extractFaceDescriptor = async (facialData: string) => {
  // This is a placeholder, the actual implementation will be in facialRecognition.ts
  // where we detect faces using face-api.js
  // For now, we'll return null to indicate that no face was detected
  return null;
};
