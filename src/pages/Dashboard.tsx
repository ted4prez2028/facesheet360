
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  ClipboardList, 
  Clock, 
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data
const patientStatistics = [
  { name: "Mon", newPatients: 4, activePatients: 22, avg: 18 },
  { name: "Tue", newPatients: 3, activePatients: 25, avg: 19 },
  { name: "Wed", newPatients: 5, activePatients: 28, avg: 22 },
  { name: "Thu", newPatients: 2, activePatients: 27, avg: 20 },
  { name: "Fri", newPatients: 6, activePatients: 30, avg: 24 },
  { name: "Sat", newPatients: 3, activePatients: 14, avg: 12 },
  { name: "Sun", newPatients: 1, activePatients: 8, avg: 6 },
];

const healthMetrics = [
  { name: "Jan", heartRate: 75, bloodPressure: 120, o2Saturation: 98 },
  { name: "Feb", heartRate: 72, bloodPressure: 118, o2Saturation: 97 },
  { name: "Mar", heartRate: 78, bloodPressure: 125, o2Saturation: 99 },
  { name: "Apr", heartRate: 74, bloodPressure: 115, o2Saturation: 98 },
  { name: "May", heartRate: 76, bloodPressure: 122, o2Saturation: 97 },
  { name: "Jun", heartRate: 73, bloodPressure: 119, o2Saturation: 98 }
];

const recentPatients = [
  { id: 1, name: "John Smith", age: 45, condition: "Hypertension", lastVisit: "2 days ago", status: "Stable" },
  { id: 2, name: "Maria Rodriguez", age: 32, condition: "Pregnancy", lastVisit: "1 day ago", status: "Follow-up" },
  { id: 3, name: "Robert Johnson", age: 67, condition: "Diabetes Type 2", lastVisit: "Today", status: "Critical" },
  { id: 4, name: "Emily Davis", age: 28, condition: "Migraine", lastVisit: "3 days ago", status: "Stable" }
];

const upcomingAppointments = [
  { id: 1, patient: "James Wilson", time: "9:00 AM", type: "Check-up", duration: "30 min" },
  { id: 2, patient: "Sarah Thompson", time: "10:30 AM", type: "Follow-up", duration: "45 min" },
  { id: 3, patient: "Michael Brown", time: "1:15 PM", type: "Consultation", duration: "60 min" },
  { id: 4, patient: "Lisa Anderson", time: "3:00 PM", type: "Procedure", duration: "45 min" }
];

const pendingTasks = [
  { id: 1, task: "Review lab results for Robert Johnson", priority: "High", due: "Today" },
  { id: 2, task: "Update treatment plan for Maria Rodriguez", priority: "Medium", due: "Tomorrow" },
  { id: 3, task: "Sign off on discharge papers for Emily Davis", priority: "High", due: "Today" },
  { id: 4, task: "Follow up on referral for John Smith", priority: "Low", due: "Next Week" }
];

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("week");
  const { toast } = useToast();
  const { data: dashboardData, isLoading, error } = useDashboardData();

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      toast({
        title: "Dashboard updated",
        description: "All patient data is now up to date",
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Dr. Smith. Here's what's happening today.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.activePatients || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Updated just now
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.todayAppointments || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For today
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.pendingTasks || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Needs attention
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CareCoins Earned</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{dashboardData?.careCoinsEarned || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total balance
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="patients">Patients</TabsTrigger>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setTimeframe("week")}>
                Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeframe("month")}>
                Month
              </Button>
              <Button variant="outline" size="sm" onClick={() => setTimeframe("year")}>
                Year
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Patient Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={patientStatistics}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="newPatients"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          activeDot={{ r: 8 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="activePatients" 
                          stroke="#6366f1" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={healthMetrics}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="heartRate" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="bloodPressure" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Age</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Condition</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Last Visit</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">{patient.name}</td>
                          <td className="py-3 px-4">{patient.age}</td>
                          <td className="py-3 px-4">{patient.condition}</td>
                          <td className="py-3 px-4">{patient.lastVisit}</td>
                          <td className="py-3 px-4">
                            <Badge variant={patient.status === "Critical" ? "destructive" : "outline"}>
                              {patient.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Chart</Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
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
          </TabsContent>
          
          <TabsContent value="tasks" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{task.task}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Badge variant={
                            task.priority === "High" 
                              ? "destructive" 
                              : task.priority === "Medium" 
                                ? "outline" 
                                : "secondary"
                          }>
                            {task.priority}
                          </Badge>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                          <span>Due: {task.due}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>Complete</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CareCoins Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-medium">Treatment plan updated</div>
                    <div className="text-sm text-muted-foreground">Maria Rodriguez</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    +15 coins
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-medium">Diagnostic notes added</div>
                    <div className="text-sm text-muted-foreground">Robert Johnson</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    +10 coins
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-medium">Medication prescribed</div>
                    <div className="text-sm text-muted-foreground">Emily Davis</div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    +20 coins
                  </Badge>
                </div>
                
                <Button className="w-full" variant="outline">
                  View all transactions
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Users className="h-5 w-5" />
                  <span>Add Patient</span>
                </Button>
                
                <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule</span>
                </Button>
                
                <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="outline">
                  <ClipboardList className="h-5 w-5" />
                  <span>Create Note</span>
                </Button>
                
                <Button className="h-auto py-4 flex flex-col items-center justify-center gap-2" variant="outline">
                  <Activity className="h-5 w-5" />
                  <span>Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
