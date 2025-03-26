
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const NotificationSound = () => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/notification.mp3');
    }
    
    // Create a channel to listen for notifications
    const channel = supabase.channel('notification-sound')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload: any) => {
        const notification = payload.new;
        
        // Only show notifications meant for this user
        if (notification.user_id === user.id) {
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => 
              console.log('Error playing notification sound:', err)
            );
          }
          
          // Show toast notification
          toast({
            title: notification.title,
            description: notification.message,
          });
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default NotificationSound;
