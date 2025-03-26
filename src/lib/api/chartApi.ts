
import { supabase } from "@/integrations/supabase/client";
import { ChartRecord, Patient } from "@/types";

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

export const addChartRecord = async (record: Partial<ChartRecord>) => {
  try {
    if (!record.patient_id || !record.provider_id || !record.record_type) {
      throw new Error("Missing required chart record fields");
    }
    
    const { data, error } = await supabase
      .from("chart_records")
      .insert({
        patient_id: record.patient_id,
        provider_id: record.provider_id,
        record_type: record.record_type,
        record_date: record.record_date || new Date().toISOString(),
        diagnosis: record.diagnosis,
        notes: record.notes,
        vital_signs: record.vital_signs,
        medications: record.medications
      })
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
