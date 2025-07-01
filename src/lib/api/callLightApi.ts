
import { supabase } from '@/integrations/supabase/client';
import { CallLightRequest } from '@/types';

export interface CallLightRequestPayload {
  patient_id: string;
  request_type: string;
  message?: string;
}

export const createCallLightRequest = async (requestData: CallLightRequestPayload): Promise<CallLightRequest> => {
  // Mock implementation since we don't have call_light_requests table
  const mockRequest: CallLightRequest = {
    id: `req_${Date.now()}`,
    patient_id: requestData.patient_id,
    request_type: requestData.request_type,
    message: requestData.message,
    status: 'active',
    created_at: new Date().toISOString()
  };
  
  console.log('Mock call light request created:', mockRequest);
  return mockRequest;
};

export const getPatientCallLightHistory = async (patientId: string): Promise<CallLightRequest[]> => {
  // Mock implementation
  return [
    {
      id: `req_${Date.now()}_1`,
      patient_id: patientId,
      request_type: 'bathroom',
      message: 'Need assistance to bathroom',
      status: 'completed',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 3000000).toISOString(),
      completed_by: 'nurse_123'
    },
    {
      id: `req_${Date.now()}_2`,
      patient_id: patientId,
      request_type: 'pain',
      message: 'Pain level 7/10',
      status: 'in_progress', 
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];
};

export const getActiveCallLightRequests = async (): Promise<CallLightRequest[]> => {
  // Mock implementation
  return [
    {
      id: `req_${Date.now()}_active_1`,
      patient_id: 'patient_123',
      request_type: 'emergency',
      message: 'Urgent assistance needed',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];
};

export const updateCallLightRequest = async (
  requestId: string, 
  updates: Partial<CallLightRequest>
): Promise<CallLightRequest> => {
  // Mock implementation
  const mockUpdatedRequest: CallLightRequest = {
    id: requestId,
    patient_id: updates.patient_id || 'patient_123',
    request_type: updates.request_type || 'general',
    message: updates.message,
    status: updates.status || 'completed',
    created_at: updates.created_at || new Date().toISOString(),
    completed_at: updates.completed_at,
    completed_by: updates.completed_by
  };
  
  console.log('Mock call light request updated:', mockUpdatedRequest);
  return mockUpdatedRequest;
};
