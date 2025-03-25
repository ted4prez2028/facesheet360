
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity,
  BarChart3,
  CalendarRange,
  Download,
  FileText,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Mock data for charts
const patientTrendsData = [
  { month: "Jan", newPatients: 25, activePatients: 120, discharge: 18 },
  { month: "Feb", newPatients: 30, activePatients: 132, discharge: 22 },
  { month: "Mar", newPatients: 28, activePatients: 138, discharge: 20 },
  { month: "Apr", newPatients: 35, activePatients: 153, discharge: 24 },
  { month: "May", newPatients: 32, activePatients: 161, discharge: 27 },
  { month: "Jun", newPatients: 38, activePatients: 172, discharge: 25 },
  { month: "Jul", newPatients: 42, activePatients: 189, discharge: 29 },
  { month: "Aug", newPatients: 40, activePatients: 200, discharge: 30 },
  { month: "Sep", newPatients: 45, activePatients: 215, discharge: 35 },
  { month: "Oct", newPatients: 50, activePatients: 230, discharge: 32 },
  { month: "Nov", newPatients: 48, activePatients: 246, discharge: 38 },
  { month: "Dec", newPatients: 52, activePatients: 260, discharge: 40 },
];

const appointmentData = [
  { month: "Jan", scheduled: 75, completed: 68, cancelled: 7 },
  { month: "Feb", scheduled: 85, completed: 75, cancelled: 10 },
  { month: "Mar", scheduled: 90, completed: 82, cancelled: 8 },
  { month: "Apr", scheduled: 95, completed: 85, cancelled: 10 },
  { month: "May", scheduled: 100, completed: 92, cancelled: 8 },
  { month: "Jun", scheduled: 110, completed: 98, cancelled: 12 },
  { month: "Jul", scheduled: 115, completed: 105, cancelled: 10 },
  { month: "Aug", scheduled: 120, completed: 108, cancelled: 12 },
  { month: "Sep", scheduled: 125, completed: 115, cancelled: 10 },
  { month: "Oct", scheduled: 130, completed: 120, cancelled: 10 },
  { month: "Nov", scheduled: 135, completed: 125, cancelled: 10 },
  { month: "Dec", scheduled: 140, completed: 130, cancelled: 10 },
];

const patientDemographicsData = [
  { name: "0-17", value: 120 },
  { name: "18-30", value: 180 },
  { name: "31-45", value: 250 },
  { name: "46-60", value: 210 },
  { name: "61+", value: 190 },
];

const diagnosisData = [
  { name: "Hypertension", value: 120 },
  { name: "Diabetes", value: 95 },
  { name: "Asthma", value: 75 },
  { name: "Depression", value: 60 },
  { name: "Arthritis", value: 50 },
  { name: "Other", value: 150 },
];

const providerPerformanceData = [
  { name: "Patient Volume", 'Dr. Smith': 85, 'Dr. Johnson': 90, 'Dr. Williams': 78, 'Dr. Brown': 92 },
  { name: "Care Quality", 'Dr. Smith': 90, 'Dr. Johnson': 85, 'Dr. Williams': 88, 'Dr. Brown': 87 },
  { name: "Documentation", 'Dr. Smith': 80, 'Dr. Johnson': 95, 'Dr. Williams': 85, 'Dr. Brown': 90 },
  { name: "Patient Satisfaction", 'Dr. Smith': 92, 'Dr. Johnson': 88, 'Dr. Williams': 90, 'Dr. Brown': 85 },
  { name: "Treatment Outcomes", 'Dr. Smith': 88, 'Dr. Johnson': 82, 'Dr. Williams': 95, 'Dr. Brown': 89 },
];

const careCoinsData = [
  { month: "Jan", earned: 520, spent: 120 },
  { month: "Feb", earned: 580, spent: 150 },
  { month: "Mar", earned: 620, spent: 200 },
  { month: "Apr", earned: 750, spent: 250 },
  { month: "May", earned: 800, spent: 300 },
  { month: "Jun", earned: 920, spent: 320 },
  { month: "Jul", earned: 1050, spent: 350 },
  { month: "Aug", earned: 980, spent: 400 },
  { month: "Sep", earned: 1100, spent: 450 },
  { month: "Oct", earned: 1200, spent: 500 },
  { month: "Nov", earned: 1300, spent: 550 },
  { month: "Dec", earned: 1500, spent: 600 },
];

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"
];

const Analytics = () => {
  const [timeframe, setTimeframe] = useState("year");
  
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your healthcare practice performance
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,245</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +12.5% from last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">856</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +8.2% from last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Charting Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +2.3% from last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CareCoins Generated</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12,450</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-xs text-green-600">
                  +15.7% from last {timeframe}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="carecoin">CareCoins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Patient Trends</CardTitle>
                  <CardDescription>
                    New and active patients over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={patientTrendsData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorNewPatients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorActivePatients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="newPatients" 
                          name="New Patients"
                          stroke="#0ea5e9" 
                          fillOpacity={1} 
                          fill="url(#colorNewPatients)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="activePatients" 
                          name="Active Patients"
                          stroke="#8884d8" 
                          fillOpacity={1} 
                          fill="url(#colorActivePatients)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Appointment Analytics</CardTitle>
                  <CardDescription>
                    Scheduled, completed, and cancelled appointments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={appointmentData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                        <Bar dataKey="scheduled" name="Scheduled" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Patient Demographics</CardTitle>
                  <CardDescription>
                    Age distribution of patient population
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={patientDemographicsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {patientDemographicsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Common Diagnoses</CardTitle>
                  <CardDescription>
                    Distribution of primary diagnoses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={diagnosisData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {diagnosisData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Key operational performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart outerRadius={90} data={providerPerformanceData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Dr. Smith" dataKey="Dr. Smith" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
                        <Radar name="Dr. Johnson" dataKey="Dr. Johnson" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Tooltip 
                          contentStyle={{ 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                            border: 'none' 
                          }} 
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="patients" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Detailed Patient Analytics</CardTitle>
                <CardDescription>
                  In-depth patient population metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-8 text-muted-foreground">
                    Detailed patient analytics content would appear here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="providers" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>
                  Comparative analysis of provider metrics and outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-8 text-muted-foreground">
                    Provider performance analytics content would appear here
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="carecoin" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>CareCoins Analytics</CardTitle>
                <CardDescription>
                  Tracking of CareCoins generation and utilization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={careCoinsData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorEarned" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                          border: 'none' 
                        }} 
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="earned" 
                        name="Earned"
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorEarned)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="spent" 
                        name="Spent"
                        stroke="#f43f5e" 
                        fillOpacity={1} 
                        fill="url(#colorSpent)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">12,450 coins</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">3,840 coins</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-health-600">8,610 coins</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">CareCoins Distribution</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LineChart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Charting Completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">7,250 coins</div>
                        <div className="text-xs text-muted-foreground">(58.2%)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Patient Outcomes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">2,450 coins</div>
                        <div className="text-xs text-muted-foreground">(19.7%)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Treatment Plans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">1,750 coins</div>
                        <div className="text-xs text-muted-foreground">(14.1%)</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Other Activities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">1,000 coins</div>
                        <div className="text-xs text-muted-foreground">(8.0%)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
