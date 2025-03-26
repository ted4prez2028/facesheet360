
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
    const channel = supabase.channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications' 
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
      
    // Also listen for broadcast messages via the realtime API
    const broadcastChannel = supabase.channel('broadcast')
      .on('broadcast', { event: 'notification' }, (payload: any) => {
        const { title, description, recipient_id } = payload.payload || payload;
        
        // Only show notifications meant for this user
        if (recipient_id === user.id) {
          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(err => 
              console.log('Error playing notification sound:', err)
            );
          }
          
          // Show toast notification
          toast({
            title,
            description,
          });
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(broadcastChannel);
    };
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default NotificationSound;
