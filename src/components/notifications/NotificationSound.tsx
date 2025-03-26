
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const NotificationSound = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    // Create a channel to listen for notifications
    const channel = supabase.channel('notifications')
      .on('broadcast', { event: 'notification' }, (payload: any) => {
        const { title, description, recipient_id } = payload;
        
        // Only show notifications meant for this user
        if (recipient_id === user.id) {
          // Play notification sound
          const audio = new Audio('/ringtone.mp3');
          audio.play().catch(err => console.log('Error playing notification sound:', err));
          
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
    };
  }, [user]);
  
  // This component doesn't render anything
  return null;
};

export default NotificationSound;
