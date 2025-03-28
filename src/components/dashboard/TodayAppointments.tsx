
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useAppointmentsToday, TodayAppointment } from "@/hooks/useAppointmentsToday";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TodayAppointmentsProps {
  appointments?: TodayAppointment[];
  isLoading?: boolean;
}

const TodayAppointments = ({ appointments: propAppointments, isLoading: propIsLoading }: TodayAppointmentsProps) => {
  const navigate = useNavigate();
  const { data: fetchedAppointments, isLoading, refetch } = useAppointmentsToday();
  
  // Use provided appointments if available, otherwise use fetched data
  const appointments = propAppointments || fetchedAppointments || [];
  const loading = propIsLoading !== undefined ? propIsLoading : isLoading;
  
  const handleReschedule = (id: string) => {
    // For now, we'll just show a toast since the rescheduling UI isn't ready
    toast.info("Rescheduling feature is coming soon!");
  };
  
  const handleStartAppointment = async (id: string, patient: string) => {
    try {
      // Update the appointment status to "in-progress"
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in-progress' })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Started appointment with ${patient}`);
      refetch(); // Refresh the data
      
      // Navigate to the charting page
      navigate('/charting');
    } catch (error) {
      console.error("Error starting appointment:", error);
      toast.error("Failed to start appointment");
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{appointment.patient}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{appointment.time}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>{appointment.type}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>{appointment.duration}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleReschedule(appointment.id)}>Reschedule</Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleStartAppointment(appointment.id, appointment.patient)}
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No appointments scheduled for today.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
