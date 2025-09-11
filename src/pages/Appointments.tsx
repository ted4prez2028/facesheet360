import { useState, useEffect } from "react";
import { useAppointments, useCreateAppointment } from "@/hooks/useAppointments";
import { Appointment } from "@/lib/api/appointmentApi";
import AppointmentForm from "@/components/appointments/AppointmentForm";
import { ChevronLeft, ChevronRight, Clock, Filter, MoreHorizontal, Plus, Search, User } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameDay, addWeeks, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CalendarAppointment {
  id: string;
  patientName: string;
  patientId: string;
  date: Date;
  type: string;
  duration: number;
  notes?: string;
}

const Appointments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarView, setCalendarView] = useState("week");
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);

  const { data: appointments = [] } = useAppointments();
  const [appointmentsData, setAppointmentsData] = useState<CalendarAppointment[]>([]);
  const createAppointment = useCreateAppointment();

  useEffect(() => {
    const formatted = appointments.map((a: any) => ({
      id: a.id,
      patientName: `${a.patients?.first_name ?? ''} ${a.patients?.last_name ?? ''}`.trim(),
      patientId: a.patient_id,
      date: new Date(a.appointment_date),
      type: a.notes?.split(':')[0] || 'Appointment',
      duration: 30,
      notes: a.notes || ''
    }));
    setAppointmentsData(formatted);
  }, [appointments]);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (date: Date) => {
    return appointmentsData.filter(appointment =>
      isSameDay(appointment.date, date)
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const handleCreateAppointment = (data: Appointment) => {
    createAppointment.mutate(data, {
      onSuccess: (newAppointment) => {
        setShowNewAppointmentDialog(false);
        if (newAppointment) {
          const formatted = {
            id: newAppointment.id!,
            patientName: `${newAppointment.patients?.first_name ?? ''} ${newAppointment.patients?.last_name ?? ''}`.trim(),
            patientId: newAppointment.patient_id,
            date: new Date(newAppointment.appointment_date),
            type: newAppointment.notes?.split(':')[0] || 'Appointment',
            duration: 30,
            notes: newAppointment.notes || ''
          };
          setAppointmentsData(prev => [...prev, formatted]);
        }
      }
    });
  };
  
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
  
  const formatTimeSlot = (hour: number) => {
    return `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
  };
  
  const getAppointmentForTimeSlot = (day: Date, hour: number) => {
    return appointmentsData.filter(appointment => 
      isSameDay(appointment.date, day) && 
      appointment.date.getHours() === hour
    );
  };
  
  const handlePreviousWeek = () => {
    setWeekStart(subWeeks(weekStart, 1));
  };
  
  const handleNextWeek = () => {
    setWeekStart(addWeeks(weekStart, 1));
  };
  
  const handleToday = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };
  
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
  
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
            <p className="text-muted-foreground">
              Manage your schedule and patient appointments
            </p>
          </div>
          
          <Dialog open={showNewAppointmentDialog} onOpenChange={setShowNewAppointmentDialog}>
            <DialogTrigger asChild>
              <Button className="bg-health-600 hover:bg-health-700 flex gap-2">
                <Plus className="h-4 w-4" />
                <span>New Appointment</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new patient appointment.
                </DialogDescription>
              </DialogHeader>
              
              <AppointmentForm
                onSubmit={handleCreateAppointment}
                onCancel={() => setShowNewAppointmentDialog(false)}
                isLoading={createAppointment.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search appointments..."
                className="pl-8 bg-background w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            
            <Select defaultValue="doctor">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View as" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">View as Doctor</SelectItem>
                <SelectItem value="nurse">View as Nurse</SelectItem>
                <SelectItem value="therapist">View as Therapist</SelectItem>
                <SelectItem value="all">View all staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </div>
            
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <Select value={calendarView} onValueChange={setCalendarView}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-6">
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
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {days.map((day, dayIndex) => {
                    const dayAppointments = getAppointmentsForDay(day);
                    if (dayAppointments.length === 0) return null;
                    
                    return (
                      <div key={dayIndex} className="space-y-3">
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
                            <div 
                              key={appointment.id}
                              className="p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                      {appointment.patientName.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  
                                  <div>
                                    <div className="font-medium">{appointment.patientName}</div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-3 w-3" />
                                      {format(appointment.date, "h:mm a")}
                                      <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                                      {appointment.duration} min
                                      <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                                      ID: {appointment.patientId}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={getAppointmentTypeColor(appointment.type)}
                                  >
                                    {appointment.type}
                                  </Badge>
                                  
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>View Details</DropdownMenuItem>
                                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                      <DropdownMenuItem>Cancel Appointment</DropdownMenuItem>
                                      <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              
                              {appointment.notes && (
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {appointment.notes}
                                </div>
                              )}
                              
                              <div className="mt-3 flex gap-2">
                                <Button size="sm" variant="outline">Patient Chart</Button>
                                <Button size="sm" variant="outline">Check In</Button>
                                <Button 
                                  size="sm" 
                                  className="bg-health-600 hover:bg-health-700"
                                >
                                  Start Session
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>View your schedule for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointmentsData
                    .filter(appointment => {
                      const today = new Date();
                      const weekFromNow = addDays(today, 7);
                      return appointment.date >= today && appointment.date <= weekFromNow;
                    })
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((appointment) => (
                      <div 
                        key={appointment.id}
                        className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{appointment.patientName}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>{format(appointment.date, "PPP")}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                            <span>{format(appointment.date, "h:mm a")}</span>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                            <span>{appointment.type}</span>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            isToday(appointment.date) 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-muted"
                          )}
                        >
                          {isToday(appointment.date) ? "Today" : format(appointment.date, "EEE")}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing upcoming appointments for the next 7 days
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default Appointments;
