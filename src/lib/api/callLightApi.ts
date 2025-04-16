
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CallLight {
  id: string;
  patient_id: string;
  room_number: string;
  request_type: 'assistance' | 'emergency' | 'pain' | 'bathroom' | 'water' | 'other';
  message?: string;
  status: 'active' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
  completed_by?: string;
  organization?: string;
}

/**
 * Create a new call light request
 */
export const createCallLight = async (callLight: Omit<CallLight, "id" | "created_at" | "updated_at" | "status">): Promise<CallLight | null> => {
  try {
    // If organization is not provided, try to get it from the current user
    if (!callLight.organization) {
      const { data: userData } = await supabase
        .from('users')
        .select('organization')
        .eq('id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();
      
      if (userData?.organization) {
        callLight.organization = userData.organization;
      }
    }

    const { data, error } = await supabase
      .from('call_lights')
      .insert({
        ...callLight,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create a notification for all staff in the organization
    if (data) {
      try {
        const { data: staffData } = await supabase
          .from('users')
          .select('id')
          .eq('organization', callLight.organization)
          .neq('id', (await supabase.auth.getUser()).data.user?.id || '');
        
        if (staffData && staffData.length > 0) {
          const notifications = staffData.map(staff => ({
            user_id: staff.id,
            title: `Call Light: ${callLight.request_type}`,
            message: `Room ${callLight.room_number} needs ${callLight.request_type}${callLight.message ? `: ${callLight.message}` : ''}`,
            type: 'call_light',
            read: false,
            event_id: data.id
          }));
          
          await supabase.from('notifications').insert(notifications);
        }
      } catch (notificationError) {
        console.error("Error creating notifications:", notificationError);
      }
    }
    
    return data as CallLight;
  } catch (error) {
    console.error("Error creating call light:", error);
    toast.error("Failed to create call light request");
    return null;
  }
};

/**
 * Update a call light status
 */
export const updateCallLightStatus = async (id: string, status: 'in_progress' | 'completed'): Promise<CallLight | null> => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };
    
    // If status is completed, set completed_at and completed_by
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
      updateData.completed_by = (await supabase.auth.getUser()).data.user?.id;
    }
    
    const { data, error } = await supabase
      .from('call_lights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as CallLight;
  } catch (error) {
    console.error("Error updating call light:", error);
    toast.error("Failed to update call light");
    return null;
  }
};

/**
 * Get all active call lights for an organization
 */
export const getActiveCallLights = async (organization?: string): Promise<CallLight[]> => {
  try {
    let query = supabase
      .from('call_lights')
      .select('*, patients(first_name, last_name)')
      .in('status', ['active', 'in_progress'])
      .order('created_at', { ascending: false });
    
    if (organization) {
      query = query.eq('organization', organization);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data as unknown as CallLight[];
  } catch (error) {
    console.error("Error fetching call lights:", error);
    return [];
  }
};

/**
 * Get call light history for a patient
 */
export const getPatientCallLightHistory = async (patientId: string): Promise<CallLight[]> => {
  try {
    const { data, error } = await supabase
      .from('call_lights')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as CallLight[];
  } catch (error) {
    console.error("Error fetching call light history:", error);
    return [];
  }
};
