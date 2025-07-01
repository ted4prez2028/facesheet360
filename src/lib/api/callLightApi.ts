
import { supabase } from '@/integrations/supabase/client';

export interface CallLight {
  id: string;
  room_number: string;
  patient_name: string;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  description?: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface CallLightRequest {
  id: string;
  room_number: string;
  patient_name: string;
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  description?: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  created_at: string;
  updated_at: string;
}

export const callLightApi = {
  // Mock implementation since call_lights table doesn't exist
  async getRequests(): Promise<CallLightRequest[]> {
    // Return mock data for now
    return [
      {
        id: '1',
        room_number: '101',
        patient_name: 'John Doe',
        urgency_level: 'high',
        description: 'Need assistance with medication',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  },

  async createRequest(request: Omit<CallLightRequest, 'id' | 'created_at' | 'updated_at' | 'status'>): Promise<CallLightRequest> {
    // Mock implementation
    const newRequest: CallLightRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return newRequest;
  },

  async updateRequest(id: string, updates: Partial<CallLightRequest>): Promise<CallLightRequest> {
    // Mock implementation
    return {
      id,
      room_number: '101',
      patient_name: 'John Doe',
      urgency_level: 'high',
      description: 'Need assistance with medication',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...updates
    };
  }
};

export const getActiveCallLights = async (): Promise<CallLight[]> => {
  return callLightApi.getRequests();
};

export const updateCallLightStatus = async (id: string, status: string): Promise<void> => {
  await callLightApi.updateRequest(id, { status: status as any });
};

export const createCallLight = async (data: {
  patient_id: string;
  room_number: string;
  request_type: string;
  message?: string;
}): Promise<CallLight> => {
  return callLightApi.createRequest({
    room_number: data.room_number,
    patient_name: 'Patient',
    urgency_level: 'medium',
    description: data.message
  });
};

export const getPatientCallLightHistory = async (patientId: string): Promise<CallLightRequest[]> => {
  return callLightApi.getRequests();
};
