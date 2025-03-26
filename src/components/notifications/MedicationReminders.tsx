
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prescription } from '@/types';
import { useUpdatePrescriptionStatus } from '@/hooks/usePrescriptions';
import { format, isToday, parseISO } from 'date-fns';

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
    
    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
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
      // For this example, we'll just show all active medications
      const dueMedications = data as (Prescription & { 
        patients: { first_name: string; last_name: string } | null;
      })[];
      
      setUpcomingMedications(dueMedications);
      
      // Show notification for medications due soon
      if (dueMedications.length > 0) {
        const dueNow = dueMedications[0];
        toast(
          <div className="flex flex-col space-y-1">
            <div className="font-medium">Medication Reminder</div>
            <div className="text-sm">{dueNow.medication_name} - {dueNow.dosage}</div>
            <div className="flex mt-2 space-x-2">
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAdministerMedication(dueNow.id)}
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
            duration: 10000,
            icon: <Bell className="h-5 w-5 text-amber-500" />
          }
        );
      }
    } catch (error) {
      console.error('Error fetching medication reminders:', error);
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
