
import { useState } from "react";
import { format, isSameDay, isToday } from "date-fns";
import { MoreHorizontal, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import AppointmentCard from "./AppointmentCard";
import { useDeleteAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface AppointmentData {
  id: string;
  appointment_date: string;
  notes?: string;
  status: string;
  patients?: Patient;
  patientName?: string;
  type?: string;
}

interface AppointmentListProps {
  appointments: AppointmentData[];
  view?: "list" | "day" | "upcoming";
  onReschedule?: (appointment: AppointmentData) => void;
  onViewDetails?: (appointment: AppointmentData) => void;
}

const AppointmentList = ({
  appointments = [],
  view = "list",
  onReschedule,
  onViewDetails,
}: AppointmentListProps) => {
  const { mutate: deleteAppointment } = useDeleteAppointment();
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      deleteAppointment(id, {
        onSuccess: () => {
          toast.success('Appointment cancelled successfully');
        },
        onError: (error: any) => {
          const errorMessage = error?.message || 'Failed to cancel appointment';
          toast.error(`Error cancelling appointment: ${errorMessage}`);
        }
      });
    }
  };

  const handleSendReminder = (appointment: AppointmentData) => {
    // Implementation would connect to notification system
    toast.success(`Reminder sent to ${appointment.patients?.first_name || 'patient'}`);
  };

  const handleCheckIn = (appointment: AppointmentData) => {
    // Implementation would update appointment status
    toast.success(`${appointment.patients?.first_name || 'Patient'} checked in`);
  };

  const handleStartSession = (appointment: AppointmentData) => {
    // Implementation would start virtual session or mark as in-progress
    toast.success(`Session started with ${appointment.patients?.first_name || 'patient'}`);
  };

  const getAppointmentTypeColor = (notes?: string) => {
    // Extract appointment type from notes or use default
    const appointmentType = notes?.split(':')[0]?.trim()?.toLowerCase() || "check-up";
    
    switch (appointmentType) {
      case "check-up":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "follow-up":
        return "bg-green-50 text-green-700 border-green-200";
      case "consultation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "procedure":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200";
      case "therapy":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const dateKey = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, AppointmentData[]>);

  if (view === "upcoming") {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">
                No upcoming appointments found
              </div>
            ) : (
              appointments.map((appointment) => (
                <AppointmentCard 
                  key={appointment.id}
                  appointment={{
                    ...appointment,
                    patientName: appointment.patients ? 
                      `${appointment.patients.first_name} ${appointment.patients.last_name}` : 
                      'Unknown Patient',
                    date: appointment.appointment_date,
                    type: appointment.notes?.split(':')[0]?.trim() || "check-up",
                    notes: appointment.notes || '',
                    duration: 30,
                    patients: appointment.patients ? {
                      first_name: appointment.patients.first_name,
                      last_name: appointment.patients.last_name
                    } : {
                      first_name: 'Unknown',
                      last_name: 'Patient'
                    }
                  }}
                  onView={() => onViewDetails?.(appointment)}
                  onReschedule={() => onReschedule?.(appointment)}
                  onCancel={() => handleDelete(appointment.id)}
                  onSendReminder={() => handleSendReminder(appointment)}
                  onCheckIn={() => handleCheckIn(appointment)}
                  onStartSession={() => handleStartSession(appointment)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-6">
        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="text-center p-4 text-muted-foreground border rounded-lg">
            No appointments found
          </div>
        ) : (
          Object.entries(groupedAppointments).map(([dateKey, dayAppointments]) => {
            const day = new Date(dateKey);
            
            return (
              <div key={dateKey} className="space-y-3">
                <h3 className={cn(
                  "text-lg font-semibold flex items-center",
                  isToday(day) && "text-primary"
                )}>
                  {format(day, "EEEE, MMMM d")}
                  {isToday(day) && (
                    <Badge variant="outline" className="ml-2 bg-primary/10">Today</Badge>
                  )}
                </h3>
                
                <div className="space-y-3">
                  {dayAppointments.map((appointment) => (
                    <AppointmentCard 
                      key={appointment.id}
                      appointment={{
                        ...appointment,
                        patientName: appointment.patients ? 
                          `${appointment.patients.first_name} ${appointment.patients.last_name}` : 
                          'Unknown Patient',
                        date: appointment.appointment_date,
                        type: appointment.notes?.split(':')[0]?.trim() || "check-up",
                        notes: appointment.notes || '',
                        duration: 30,
                        patients: appointment.patients ? {
                          first_name: appointment.patients.first_name,
                          last_name: appointment.patients.last_name
                        } : {
                          first_name: 'Unknown',
                          last_name: 'Patient'
                        }
                      }}
                      onView={() => onViewDetails?.(appointment)}
                      onReschedule={() => onReschedule?.(appointment)}
                      onCancel={() => handleDelete(appointment.id)}
                      onSendReminder={() => handleSendReminder(appointment)}
                      onCheckIn={() => handleCheckIn(appointment)}
                      onStartSession={() => handleStartSession(appointment)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  }

  return null;
};

export default AppointmentList;
