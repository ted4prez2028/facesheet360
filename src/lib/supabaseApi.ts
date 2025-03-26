
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// User management
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    toast.error("Error fetching user profile");
    throw error;
  }
};

export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
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
export const getPatients = async (filters = {}) => {
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

export const createPatient = async (patientData: any) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
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

export const updatePatient = async (id: string, patientData: any) => {
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
      .single();
      
    if (error) throw error;
    return data.care_coins_balance;
  } catch (error) {
    console.error("Error fetching CareCoins balance:", error);
    toast.error("Error fetching CareCoins balance");
    throw error;
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
    throw error;
  }
};

export const getPatientByFacialData = async (facialData: string) => {
  // This would typically be implemented as an edge function for more complex matching logic
  // For now, we'll just return a placeholder implementation
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .not('facial_data', 'is', null);
      
    if (error) throw error;
    
    // In a real app, you would implement facial comparison here
    // This is just a placeholder
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error recognizing face:", error);
    toast.error("Error recognizing face");
    throw error;
  }
};
