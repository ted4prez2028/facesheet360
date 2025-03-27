
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface Appointment {
  id: number;
  patient: string;
  time: string;
  type: string;
  duration: string;
}

interface TodayAppointmentsProps {
  appointments: Appointment[];
}

const TodayAppointments = ({ appointments }: TodayAppointmentsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent>
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
                <Button size="sm" variant="outline">Reschedule</Button>
                <Button size="sm">Start</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TodayAppointments;
