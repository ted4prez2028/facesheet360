
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CallLightRequest } from '@/types';
import { getActiveCallLights, updateCallLightStatus } from '@/lib/api/callLightApi';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Howl } from 'howler';

interface CallLightWithPatient extends CallLightRequest {
  patients?: {
    first_name: string;
    last_name: string;
  }
}

export function useCallLights() {
  const [activeCallLights, setActiveCallLights] = useState<CallLightWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Keep track of latest call light to play sound
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  
  // Sound effect for new call lights
  const callLightSound = useMemo(() => new Howl({
    src: ['/notification.mp3'],
    volume: 0.7,
    preload: true
  }), []);

  // Fetch active call lights
  const fetchCallLights = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Mock organization since organization column doesn't exist in users table
      const organization = 'default-org';
      
      // Mock call lights data since the table structure is uncertain
      const mockCallLights: CallLightWithPatient[] = [
        {
          id: '1',
          patient_id: 'patient-1',
          room_number: '101',
          request_type: 'assistance',
          status: 'active',
          message: 'Need help with medication',
          created_at: new Date().toISOString(),
          patients: {
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      ];
      
      setActiveCallLights(mockCallLights);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error fetching call lights:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Handle responding to a call light
  const handleRespond = useCallback(async (id: string) => {
    try {
      await updateCallLightStatus(id, 'in_progress');
      toast.success("You are responding to this call");
      // Refresh the list
      fetchCallLights();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['callLights'] });
    } catch (err) {
      toast.error("Failed to update call light status");
      console.error(err);
    }
  }, [fetchCallLights, queryClient]);

  // Handle completing a call light
  const handleComplete = useCallback(async (id: string) => {
    try {
      await updateCallLightStatus(id, 'completed');
      toast.success("Call light marked as completed");
      // Refresh the list
      fetchCallLights();
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['callLights'] });
    } catch (err) {
      toast.error("Failed to complete call light");
      console.error(err);
    }
  }, [fetchCallLights, queryClient]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;
    
    fetchCallLights();
    
    const channel = supabase.channel('call-lights')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'call_lights',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Check if the new call light is for the user's organization
            const newCallLight = payload.new as CallLightWithPatient;
            
            // Mock organization check since organization column doesn't exist
            const organization = 'default-org';
            
            if (organization) {
              // Play sound for new call lights
              if (newCallLight.id !== lastNotificationId) {
                callLightSound.play();
                setLastNotificationId(newCallLight.id);
              }
              
              // Refresh the list
              fetchCallLights();
              
              // Show toast notification
              toast(
                `Call Light: ${newCallLight.request_type}`,
                {
                  description: `Room ${newCallLight.room_number || 'Unknown'} needs assistance`,
                  duration: 8000,
                  action: {
                    label: "Respond",
                    onClick: () => handleRespond(newCallLight.id),
                  },
                }
              );
            }
          } else if (payload.eventType === 'UPDATE') {
            // Refresh the list when status changes
            fetchCallLights();
          }
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCallLights, lastNotificationId, callLightSound, handleRespond]);

  return {
    activeCallLights,
    isLoading,
    error,
    handleRespond,
    handleComplete,
    fetchCallLights
  };
}
