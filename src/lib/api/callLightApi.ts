
import { supabase } from '@/integrations/supabase/client';
import { CallLightRequest } from '@/types';

export interface CallLightRequestPayload {
  patient_id: string;
  room_number?: string;
  request_type: string;
  message?: string;
}

export interface CallLight extends CallLightRequest {
  room_number: string;
}

export const createCallLightRequest = async (requestData: CallLightRequestPayload): Promise<CallLightRequest> => {
  const { data, error } = await supabase
    .from('call_lights')
    .insert({
      patient_id: requestData.patient_id,
      room_number: requestData.room_number,
      reason: requestData.request_type,
      notes: requestData.message,
      status: 'active'
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    patient_id: data.patient_id,
    room_number: data.room_number,
    request_type: data.reason,
    message: data.notes,
    status: data.status as 'active' | 'in_progress' | 'completed',
    created_at: data.activated_at
  };
};

// Alias for backward compatibility
export const createCallLight = createCallLightRequest;

export const getPatientCallLightHistory = async (patientId: string): Promise<CallLightRequest[]> => {
  const { data, error } = await supabase
    .from('call_lights')
    .select('*')
    .eq('patient_id', patientId)
    .order('activated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(record => ({
    id: record.id,
    patient_id: record.patient_id,
    room_number: record.room_number,
    request_type: record.reason,
    message: record.notes,
    status: record.status as 'active' | 'in_progress' | 'completed',
    created_at: record.activated_at,
    completed_at: record.resolved_at,
    completed_by: record.responded_by
  }));
};

export const getActiveCallLights = async (): Promise<CallLightRequest[]> => {
  const { data, error } = await supabase
    .from('call_lights')
    .select('*')
    .eq('status', 'active')
    .order('activated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(record => ({
    id: record.id,
    patient_id: record.patient_id,
    room_number: record.room_number,
    request_type: record.reason,
    message: record.notes,
    status: record.status as 'active' | 'in_progress' | 'completed',
    created_at: record.activated_at
  }));
};

export const updateCallLightRequest = async (
  requestId: string, 
  updates: Partial<CallLightRequest>
): Promise<CallLightRequest> => {
  const dbUpdates: any = {};
  
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.completed_at) dbUpdates.resolved_at = updates.completed_at;
  if (updates.completed_by) dbUpdates.responded_by = updates.completed_by;
  if (updates.message) dbUpdates.notes = updates.message;

  const { data, error } = await supabase
    .from('call_lights')
    .update(dbUpdates)
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    patient_id: data.patient_id,
    room_number: data.room_number,
    request_type: data.reason,
    message: data.notes,
    status: data.status as 'active' | 'in_progress' | 'completed',
    created_at: data.activated_at,
    completed_at: data.resolved_at,
    completed_by: data.responded_by
  };
};

// Alias for backward compatibility
export const updateCallLightStatus = async (requestId: string, status: CallLightRequest['status']) => {
  return updateCallLightRequest(requestId, { status });
};
