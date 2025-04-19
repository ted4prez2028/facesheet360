
import { format, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { formatTimeSlot } from "@/utils/dateUtils";

interface AppointmentCalendarProps {
  appointments: any[];
  days: Date[];
  timeSlots: number[];
}

const AppointmentCalendar = ({ 
  appointments = [],
  days,
  timeSlots
}: AppointmentCalendarProps) => {
  
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

  const getAppointmentForTimeSlot = (day: Date, hour: number) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      return isSameDay(appointmentDate, day) && 
        appointmentDate.getHours() === hour;
    });
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-b">
          {days.map((day, index) => (
            <div 
              key={index}
              className={cn(
                "px-2 py-3 text-center text-sm font-medium border-r last:border-r-0",
                isToday(day) && "bg-muted"
              )}
            >
              <div className="mb-1">{format(day, "EEE")}</div>
              <div className={cn(
                "flex items-center justify-center h-8 w-8 mx-auto rounded-full",
                isToday(day) && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-[auto_1fr] h-[700px] overflow-y-auto">
          <div className="border-r">
            {timeSlots.map((hour) => (
              <div 
                key={hour} 
                className="h-20 px-2 py-1 text-xs text-muted-foreground border-b flex items-start justify-end"
              >
                {formatTimeSlot(hour)}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r last:border-r-0">
                {timeSlots.map((hour) => {
                  const appointments = getAppointmentForTimeSlot(day, hour);
                  return (
                    <div 
                      key={hour} 
                      className={cn(
                        "h-20 border-b relative",
                        isToday(day) && "bg-muted/50"
                      )}
                    >
                      {appointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.appointment_date);
                        const appointmentType = appointment.notes?.split(':')[0]?.trim() || "check-up";
                        const patientName = appointment.patients ? 
                          `${appointment.patients.first_name} ${appointment.patients.last_name}` : 
                          'Unknown Patient';
                        
                        return (
                          <div 
                            key={appointment.id}
                            className={cn(
                              "absolute left-1 right-1 p-1 rounded-md text-xs cursor-pointer transition-colors",
                              "transform translate-y-1 shadow-sm overflow-hidden border",
                              getAppointmentTypeColor(appointmentType)
                            )}
                            style={{
                              top: `${((appointmentDate.getMinutes() / 60) * 100) - 2}%`,
                              height: `${appointment.duration ? (appointment.duration / 60) * 100 : 100 / 3}%`,
                              maxHeight: "calc(100% - 4px)"
                            }}
                          >
                            <div className="font-medium truncate">{patientName}</div>
                            <div className="truncate">{appointmentType}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
