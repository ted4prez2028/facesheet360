
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePatients } from "@/hooks/usePatients";
import { Appointment } from "@/lib/api/appointmentApi";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (data: Appointment) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AppointmentForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: AppointmentFormProps) => {
  const { user } = useAuth();
  const { data: patients, isLoading: isPatientsLoading } = usePatients();
  
  const [formData, setFormData] = useState<Partial<Appointment>>({
    patient_id: initialData?.patient_id || "",
    provider_id: initialData?.provider_id || user?.id || "",
    appointment_date: initialData?.appointment_date ? new Date(initialData.appointment_date) : new Date(),
    status: initialData?.status || "scheduled",
    notes: initialData?.notes || "",
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.appointment_date ? new Date(initialData.appointment_date) : new Date()
  );
  
  const [selectedTime, setSelectedTime] = useState<string>(
    initialData?.appointment_date 
      ? format(new Date(initialData.appointment_date), "HH:mm") 
      : format(new Date().setMinutes(0), "HH:mm")
  );
  
  const [appointmentType, setAppointmentType] = useState(initialData?.notes?.split(':')[0] || "check-up");
  const [duration, setDuration] = useState<string>("30");
  
  // Update the appointment date when date or time changes
  useEffect(() => {
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      setFormData(prev => ({
        ...prev,
        appointment_date: newDate
      }));
    }
  }, [selectedDate, selectedTime]);
  
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });
  
  const handleSubmit = () => {
    if (!formData.patient_id) {
      alert("Please select a patient");
      return;
    }
    
    const notes = `${appointmentType}: ${formData.notes || ''}`;
    
    onSubmit({
      ...formData,
      notes,
      patient_id: formData.patient_id as string,
      provider_id: formData.provider_id as string,
    } as Appointment);
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="patient">Patient</Label>
        <Select
          value={formData.patient_id}
          onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
          disabled={isLoading || isPatientsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={isPatientsLoading ? "Loading patients..." : "Select patient"} />
          </SelectTrigger>
          <SelectContent>
            {patients?.map((patient) => (
              <SelectItem 
                key={patient.id} 
                value={patient.id}
              >
                {`${patient.first_name} ${patient.last_name} ${patient.medical_record_number ? `(${patient.medical_record_number})` : ''}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal"
                disabled={isLoading}
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
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="time">Time</Label>
          <Select 
            value={selectedTime} 
            onValueChange={setSelectedTime}
            disabled={isLoading}
          >
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
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="type">Appointment Type</Label>
          <Select 
            value={appointmentType} 
            onValueChange={setAppointmentType}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="check-up">Check-up</SelectItem>
              <SelectItem value="follow-up">Follow-up</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="procedure">Procedure</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="therapy">Therapy</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select 
            value={duration} 
            onValueChange={setDuration}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add appointment notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isLoading}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          className="bg-health-600 hover:bg-health-700"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {initialData?.id ? "Update Appointment" : "Schedule Appointment"}
        </Button>
      </div>
    </div>
  );
};

export default AppointmentForm;
