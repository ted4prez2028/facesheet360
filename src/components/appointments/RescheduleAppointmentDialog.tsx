import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { useUpdateAppointment, useAppointments } from "@/hooks/useAppointments";
import { Appointment } from "@/lib/api/appointmentApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface RescheduleAppointmentDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RescheduleAppointmentDialog = ({
  appointment,
  open,
  onOpenChange,
}: RescheduleAppointmentDialogProps) => {
  const { data: allAppointments = [] } = useAppointments();
  const updateAppointment = useUpdateAppointment();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(appointment.appointment_date)
  );
  
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(appointment.appointment_date), "HH:mm")
  );

  const [conflicts, setConflicts] = useState<any[]>([]);

  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Check for conflicts when date/time changes
  useEffect(() => {
    if (!selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const proposedTime = new Date(selectedDate);
    proposedTime.setHours(hours, minutes, 0, 0);

    const proposedEnd = new Date(proposedTime);
    proposedEnd.setMinutes(proposedEnd.getMinutes() + (appointment.duration_minutes || 30));

    // Check for overlapping appointments
    const overlapping = allAppointments.filter((apt: any) => {
      if (apt.id === appointment.id) return false; // Skip current appointment
      if (apt.provider_id !== appointment.provider_id) return false; // Only check same provider
      
      const aptStart = new Date(apt.appointment_date);
      const aptEnd = new Date(aptStart);
      aptEnd.setMinutes(aptEnd.getMinutes() + (apt.duration_minutes || 30));

      // Check if times overlap
      return (
        (proposedTime >= aptStart && proposedTime < aptEnd) ||
        (proposedEnd > aptStart && proposedEnd <= aptEnd) ||
        (proposedTime <= aptStart && proposedEnd >= aptEnd)
      );
    });

    setConflicts(overlapping);
  }, [selectedDate, selectedTime, appointment, allAppointments]);

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    if (conflicts.length > 0) {
      toast.error("Cannot reschedule: Time slot conflicts with existing appointment");
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    updateAppointment.mutate({
      id: appointment.id!,
      updates: {
        appointment_date: newDate.toISOString(),
        status: 'scheduled', // Reset status on reschedule
      }
    }, {
      onSuccess: () => {
        toast.success("Appointment rescheduled successfully");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>New Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label>New Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {format(new Date().setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1])), "h:mm a")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {conflicts.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Conflict detected:</strong> This time slot overlaps with {conflicts.length} existing appointment(s).
                Please choose a different time.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="font-medium mb-1">Current Appointment:</div>
            <div className="text-muted-foreground">
              {format(new Date(appointment.appointment_date), "PPP 'at' p")}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-health-600 hover:bg-health-700"
            onClick={handleReschedule}
            disabled={updateAppointment.isPending || conflicts.length > 0}
          >
            {updateAppointment.isPending ? "Rescheduling..." : "Reschedule"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleAppointmentDialog;