import { supabase } from "@/integrations/supabase/client";
import { Patient, ChartRecord, Appointment, User } from "@/types";

// Patient functions
export const getPatients = async () => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) throw error;
    return data as Patient[];
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const getPatientById = async (id: string) => {
  try {
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

export const getPatientCharts = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from("chart_records")
      .select("*")
      .eq("patient_id", patientId)
      .order("record_date", { ascending: false });

    if (error) throw error;
    return data as ChartRecord[];
  } catch (error) {
    console.error(`Error fetching charts for patient ${patientId}:`, error);
    throw error;
  }
};

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

export const addPatient = async (patient: Partial<Patient>) => {
  try {
    if (!patient.first_name || !patient.last_name || !patient.date_of_birth || !patient.gender) {
      throw new Error("Missing required patient fields");
    }
    
    const { data, error } = await supabase
      .from("patients")
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data as Patient;
  } catch (error) {
    console.error("Error adding patient:", error);
    throw error;
  }
};

export const updatePatient = async (id: string, data: Partial<Patient>) => {
  const { date_of_birth, ...rest } = data;
  
  // Only include date_of_birth in the update if it's provided
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
};

export const deletePatient = async (id: string) => {
  try {
    const { error } = await supabase.from("patients").delete().eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting patient with ID ${id}:`, error);
    throw error;
  }
};

// Chart record functions
export const addChartRecord = async (record: Partial<ChartRecord>) => {
  try {
    if (!record.patient_id || !record.provider_id || !record.record_type) {
      throw new Error("Missing required chart record fields");
    }
    
    const { data, error } = await supabase
      .from("chart_records")
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data as ChartRecord;
  } catch (error) {
    console.error("Error adding chart record:", error);
    throw error;
  }
};

export const updateChartRecord = async (id: string, data: Partial<ChartRecord>) => {
  const { patient_id, provider_id, record_type, ...rest } = data;
  
  // Only include required fields in the update if they're provided
  const updateData: any = { ...rest };
  if (patient_id) {
    updateData.patient_id = patient_id;
  }
  if (provider_id) {
    updateData.provider_id = provider_id;
  }
  if (record_type) {
    updateData.record_type = record_type;
  }
  
  const { data: updatedRecord, error } = await supabase
    .from('chart_records')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return updatedRecord;
};

// Appointment functions
export const addAppointment = async (appointment: Partial<Appointment>) => {
  try {
    if (!appointment.patient_id || !appointment.provider_id || !appointment.appointment_date || !appointment.status) {
      throw new Error("Missing required appointment fields");
    }
    
    const { data, error } = await supabase
      .from("appointments")
      .insert(appointment)
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
  
  // Only include required fields in the update if they're provided
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

// Patient Identification by Facial Data
export const getPatientByFacialData = async () => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .not("facial_data", "is", null);

    if (error) throw error;
    
    // Process in frontend since we need to compare facial descriptors
    return data as Patient[];
  } catch (error) {
    console.error("Error fetching patients with facial data:", error);
    throw error;
  }
};

export const storeFacialData = async (patientId: string, facialData: string) => {
  try {
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

// Healthcare User functions
export const getUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data as User[];
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export const getUserProfile = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Error fetching user profile with ID ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

// CareCoin transactions
export const transferCareCoins = async (fromUserId: string, toUserId: string, amount: number) => {
  try {
    // Get sender's current balance
    const { data: sender, error: senderError } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", fromUserId)
      .single();

    if (senderError) throw senderError;
    if (!sender || sender.care_coins_balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Get recipient's current balance
    const { data: recipient, error: recipientError } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", toUserId)
      .single();

    if (recipientError) throw recipientError;
    if (!recipient) {
      throw new Error("Recipient not found");
    }

    // Update sender's balance
    const { error: updateSenderError } = await supabase
      .from("users")
      .update({ care_coins_balance: sender.care_coins_balance - amount })
      .eq("id", fromUserId);

    if (updateSenderError) throw updateSenderError;

    // Update recipient's balance
    const { error: updateRecipientError } = await supabase
      .from("users")
      .update({ care_coins_balance: recipient.care_coins_balance + amount })
      .eq("id", toUserId);

    if (updateRecipientError) throw updateRecipientError;

    // Record the transaction
    const { error: transactionError } = await supabase
      .from("care_coins_transactions")
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
        transaction_type: "transfer",
        description: "User transfer"
      });

    if (transactionError) throw transactionError;

    return true;
  } catch (error) {
    console.error("Error transferring CareCoins:", error);
    throw error;
  }
};

// Add function for getting care coins balance
export const getCareCoinsBalance = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("care_coins_balance")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data.care_coins_balance || 0;
  } catch (error) {
    console.error("Error fetching care coins balance:", error);
    throw error;
  }
};

// Add function for creating patients (for usePatients hook)
export const createPatient = async (patient: Partial<Patient>) => {
  return addPatient(patient);
};
