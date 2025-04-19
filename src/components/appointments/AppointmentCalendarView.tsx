
import { format, isSameDay, isToday } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AppointmentCalendarViewProps {
  days: Date[];
  timeSlots: number[];
  formatTimeSlot: (hour: number) => string;
  getAppointmentForTimeSlot: (day: Date, hour: number) => any[];
  getAppointmentTypeColor: (type: string) => string;
}

const AppointmentCalendarView = ({
  days,
  timeSlots,
  formatTimeSlot,
  getAppointmentForTimeSlot,
  getAppointmentTypeColor,
}: AppointmentCalendarViewProps) => {
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
                      {appointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={cn(
                            "absolute left-1 right-1 p-1 rounded-md text-xs cursor-pointer transition-colors",
                            "transform translate-y-1 shadow-sm overflow-hidden border",
                            getAppointmentTypeColor(appointment.type)
                          )}
                          style={{
                            top: `${((appointment.date.getMinutes() / 60) * 100) - 2}%`,
                            height: `${(appointment.duration / 60) * 100}%`,
                            maxHeight: "calc(100% - 4px)"
                          }}
                        >
                          <div className="font-medium truncate">{appointment.patientName}</div>
                          <div className="truncate">{appointment.type}</div>
                        </div>
                      ))}
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

export default AppointmentCalendarView;
