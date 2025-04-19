
import { format } from "date-fns";
import { Clock, MoreHorizontal, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
  appointment: any;
  onView?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onSendReminder?: () => void;
  onCheckIn?: () => void;
  onStartSession?: () => void;
}

const AppointmentCard = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
  onSendReminder,
  onCheckIn,
  onStartSession
}: AppointmentCardProps) => {
  if (!appointment) return null;
  
  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
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
  
  // Extract appointment type from notes or use default
  const appointmentType = appointment.notes?.split(':')[0]?.trim() || "check-up";
  const appointmentNotes = appointment.notes?.split(':').slice(1).join(':')?.trim() || "";
  
  // Format patient name from related data if available
  let patientName = appointment.patientName;
  if (appointment.patients) {
    patientName = `${appointment.patients.first_name} ${appointment.patients.last_name}`;
  }
  
  // Format patient ID from related data if available
  let patientId = appointment.patientId;
  if (appointment.patients?.medical_record_number) {
    patientId = appointment.patients.medical_record_number;
  }
  
  const appointmentDate = appointment.date || appointment.appointment_date;
  
  return (
    <div className="p-4 border rounded-lg hover:bg-accent/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-muted">
              {patientName?.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium">{patientName}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {appointmentDate ? format(new Date(appointmentDate), "h:mm a") : "Time N/A"}
              <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
              {appointment.duration ? `${appointment.duration} min` : "30 min"}
              {patientId && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                  ID: {patientId}
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={getAppointmentTypeColor(appointmentType)}
          >
            {appointmentType}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>}
              {onReschedule && <DropdownMenuItem onClick={onReschedule}>Reschedule</DropdownMenuItem>}
              {onCancel && <DropdownMenuItem onClick={onCancel}>Cancel Appointment</DropdownMenuItem>}
              {onSendReminder && <DropdownMenuItem onClick={onSendReminder}>Send Reminder</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {appointmentNotes && (
        <div className="mt-2 text-sm text-muted-foreground">
          {appointmentNotes}
        </div>
      )}
      
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline">Patient Chart</Button>
        {onCheckIn && (
          <Button size="sm" variant="outline" onClick={onCheckIn}>
            Check In
          </Button>
        )}
        {onStartSession && (
          <Button 
            size="sm" 
            className="bg-health-600 hover:bg-health-700"
            onClick={onStartSession}
          >
            Start Session
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
