
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CallLightRequest, getActiveCallLights, updateCallLightStatus } from '@/lib/api/callLightApi';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Howl } from 'howler';

interface CallLight extends CallLightRequest {
  patients?: {
    first_name: string;
    last_name: string;
  }
}

export function useCallLights() {
  const [activeCallLights, setActiveCallLights] = useState<CallLight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Keep track of latest call light to play sound
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  
  // Sound effect for new call lights
  const callLightSound = new Howl({
    src: ['/notification.mp3'],
    volume: 0.7,
    preload: true
  });

  // Fetch active call lights
  const fetchCallLights = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data: userData } = await supabase
        .from('users')
        .select('organization')
        .eq('id', user.id)
        .single();
      
      const organization = userData?.organization || '';
      if (!organization) {
        console.warn("User organization not found");
      }
      
      const callLights = await getActiveCallLights(organization);
      setActiveCallLights(callLights as CallLight[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error("Error fetching call lights:", err);
    } finally {
      setIsLoading(false);
    }
  };

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
            const newCallLight = payload.new as CallLight;
            
            // Get user's organization
            const { data: userData } = await supabase
              .from('users')
              .select('organization')
              .eq('id', user.id)
              .single();
            
            const organization = userData?.organization || '';
            
            if (organization && organization === newCallLight.organization) {
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
                  description: `Room ${newCallLight.room_number} needs assistance`,
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
  }, [user]);

  // Handle responding to a call light
  const handleRespond = async (id: string) => {
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
  };

  // Handle completing a call light
  const handleComplete = async (id: string) => {
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
  };

  return {
    activeCallLights,
    isLoading,
    error,
    handleRespond,
    handleComplete,
    fetchCallLights
  };
}
