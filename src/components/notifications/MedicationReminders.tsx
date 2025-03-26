
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prescription } from '@/types';
import { useUpdatePrescriptionStatus } from '@/hooks/usePrescriptions';
import { format, isToday, parseISO } from 'date-fns';
import { createNotification } from '@/lib/api/notificationApi';

const MedicationReminders = () => {
  const { user } = useAuth();
  const [upcomingMedications, setUpcomingMedications] = useState<Prescription[]>([]);
  const { mutate: updatePrescriptionStatus } = useUpdatePrescriptionStatus();
  
  useEffect(() => {
    if (!user) return;
    
    // Initial fetch of medications
    fetchDueMedications();
    
    // Set up a timer to check for medications every minute
    const intervalId = setInterval(fetchDueMedications, 60000);
    
    // Set up realtime subscription for medication updates
    const channel = supabase
      .channel('medication-reminders')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'prescriptions' 
      }, payload => {
        // Refresh medications when there's an update
        fetchDueMedications();
      })
      .subscribe();
    
    // Set up subscription for appointment reminders
    const appointmentChannel = supabase
      .channel('appointment-reminders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, payload => {
        checkUpcomingAppointments();
      })
      .subscribe();
    
    // Initial check for appointments
    checkUpcomingAppointments();
    
    // Set up interval for checking appointments every 5 minutes
    const appointmentInterval = setInterval(checkUpcomingAppointments, 300000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(appointmentInterval);
      supabase.removeChannel(channel);
      supabase.removeChannel(appointmentChannel);
    };
  }, [user]);
  
  const fetchDueMedications = async () => {
    if (!user) return;
    
    try {
      // Get current date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Query for active prescriptions that are due today
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients:patient_id (first_name, last_name)
        `)
        .eq('status', 'prescribed')
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);
      
      if (error) throw error;
      
      // Filter medications that should be taken today
      // This would typically involve more complex logic based on frequency
      const dueMedications = data as (Prescription & { 
        patients: { first_name: string; last_name: string } | null;
      })[];
      
      setUpcomingMedications(dueMedications);
      
      // Show notification for medications due soon
      if (dueMedications.length > 0) {
        // Get the current hour to check for morning, afternoon, and evening medication times
        const currentHour = new Date().getHours();
        let shouldNotify = false;
        let timeOfDay = "";
        
        // Morning medications (8-10 AM)
        if (currentHour >= 8 && currentHour <= 10) {
          shouldNotify = true;
          timeOfDay = "morning";
        }
        // Afternoon medications (12-2 PM)
        else if (currentHour >= 12 && currentHour <= 14) {
          shouldNotify = true;
          timeOfDay = "afternoon";
        }
        // Evening medications (6-8 PM)
        else if (currentHour >= 18 && currentHour <= 20) {
          shouldNotify = true;
          timeOfDay = "evening";
        }
        
        if (shouldNotify) {
          // Create notification for each due medication
          dueMedications.forEach(async (med) => {
            const patientName = med.patients 
              ? `${med.patients.first_name} ${med.patients.last_name}`
              : "your patient";
            
            await createNotification({
              user_id: user.id,
              title: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} Medication Reminder`,
              message: `${med.medication_name} (${med.dosage}) is due for ${patientName}`,
              type: "medication",
              read: false,
              event_id: med.id,
              event_time: new Date().toISOString()
            });
            
            // Also show a toast notification with action buttons
            toast(
              <div className="flex flex-col space-y-1">
                <div className="font-medium">Medication Reminder</div>
                <div className="text-sm">{med.medication_name} - {med.dosage} for {patientName}</div>
                <div className="flex mt-2 space-x-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleAdministerMedication(med.id)}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Mark as Taken
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
              </div>,
              {
                duration: 30000,
                icon: <Bell className="h-5 w-5 text-amber-500" />
              }
            );
          });
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound', e));
        }
      }
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
    }
  };
  
  const checkUpcomingAppointments = async () => {
    if (!user) return;
    
    try {
      // Get current date/time
      const now = new Date();
      
      // Calculate time 20 minutes from now
      const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);
      
      // Query for appointments that start within the next 20 minutes
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients:patient_id (first_name, last_name)
        `)
        .gte('appointment_date', now.toISOString())
        .lte('appointment_date', twentyMinutesFromNow.toISOString());
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Found appointments starting soon
        data.forEach(async (appointment) => {
          const appointmentTime = new Date(appointment.appointment_date);
          const minutesUntil = Math.floor((appointmentTime.getTime() - now.getTime()) / 60000);
          
          const patientName = appointment.patients 
            ? `${appointment.patients.first_name} ${appointment.patients.last_name}`
            : "a patient";
          
          // Create notification
          await createNotification({
            user_id: user.id,
            title: `Upcoming Appointment`,
            message: `Appointment with ${patientName} in ${minutesUntil} minutes`,
            type: "appointment",
            read: false,
            event_id: appointment.id,
            event_time: appointment.appointment_date
          });
          
          // Play notification sound
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log('Could not play notification sound', e));
        });
      }
    } catch (error) {
      console.error('Error checking upcoming appointments:', error);
    }
  };
  
  const handleAdministerMedication = (prescriptionId: string) => {
    if (!user?.id) return;
    
    updatePrescriptionStatus({
      id: prescriptionId,
      status: 'administered',
      administeredBy: user.id
    }, {
      onSuccess: () => {
        toast.success('Medication marked as taken');
        // Update local state
        setUpcomingMedications(prev => 
          prev.filter(med => med.id !== prescriptionId)
        );
      },
      onError: (error) => {
        toast.error(`Failed to update medication status: ${(error as Error).message}`);
      }
    });
  };
  
  // This component doesn't render anything visible
  // It just handles medication reminders in the background
  return null;
};

export default MedicationReminders;
