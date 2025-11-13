
import React, { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUpdatePrescriptionStatus } from '@/hooks/usePrescriptions';
import { createNotification } from '@/lib/api/notificationApi';

interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  event_id?: string;
}

const MedicationReminders = () => {
  const { user } = useAuth();
  const { mutate: updatePrescriptionStatus } = useUpdatePrescriptionStatus();
  
  const fetchDueMedications = useCallback(async () => {
    if (!user) return;
    
    try {
      // The fetch logic is now handled by the Edge Function
      // This function is kept mainly for subscription setup
      console.log('Waiting for medication notifications...');
    } catch (error) {
      console.error('Error in medication reminders:', error);
    }
  }, [user]);
  
  const showMedicationToast = useCallback((notification: NotificationPayload) => {
    // Extract medication ID from event_id if it exists
    const medicationId = notification.event_id;
    
    toast(
      <div className="flex flex-col space-y-1">
        <div className="font-medium">{notification.title}</div>
        <div className="text-sm">{notification.message}</div>
        {medicationId && (
          <div className="flex mt-2 space-x-2">
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleAdministerMedication(medicationId)}
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Mark as Administered
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => toast.dismiss()}
            >
              <Clock className="mr-1 h-3 w-3" />
              Remind Later
            </Button>
          </div>
        )}
      </div>,
      {
        duration: 30000,
        icon: <Bell className="h-5 w-5 text-amber-500" />
      }
    );
  }, []);
  
  const handleAdministerMedication = useCallback((prescriptionId: string) => {
    if (!user?.id) return;
    
    updatePrescriptionStatus({
      id: prescriptionId,
      status: 'administered',
      administeredBy: user.id
    }, {
      onSuccess: () => {
        toast.success('Medication marked as administered');
        
        // Create a notification for this action
        createNotification({
          user_id: user.id,
          title: 'Medication Administered',
          message: 'You have successfully administered this medication',
          type: 'medication',
          read: false,
          event_id: prescriptionId
        }).catch(err => console.error('Error creating notification:', err));
      },
      onError: (error) => {
        toast.error(`Failed to update medication status: ${(error as Error).message}`);
      }
    });
  }, [user, updatePrescriptionStatus]);
  
  useEffect(() => {
    if (!user) return;
    
    // Initial check for medications
    fetchDueMedications();
    
    // Set up a timer to check for medications every minute
    const intervalId = setInterval(fetchDueMedications, 60000);
    
    // Set up realtime subscription for medication updates
    const medicationChannel = supabase
      .channel('medication-reminders')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'prescriptions' 
      }, () => {
        // Refresh medications when there's an update
        fetchDueMedications();
      })
      .subscribe();
    
    // Set up subscription for notifications
    const notificationChannel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload: { new: NotificationPayload }) => {
        const notification = payload.new;
        
        // Only handle new notifications for this user
        if (notification.user_id === user.id) {
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound', e));
          
          // Show toast notification with different styling based on type
          if (notification.type === 'medication') {
            showMedicationToast(notification);
          } else {
            // Show standard toast for other notification types
            toast(notification.title, {
              description: notification.message,
              duration: 6000,
              icon: <Bell className="h-5 w-5 text-blue-500" />
            });
          }
        }
      })
      .subscribe();
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(medicationChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user, fetchDueMedications, showMedicationToast, handleAdministerMedication]);
  
  // This component doesn't render anything visible
  // It just handles medication reminders in the background
  return null;
};

export default MedicationReminders;
