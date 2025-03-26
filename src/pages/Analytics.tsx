
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
  Loader2,
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
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

// Colors for charts
const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"
];

const Analytics = () => {
  const [timeframe, setTimeframe] = useState("year");
  const { data: analyticsData, isLoading, isError } = useAnalyticsData(timeframe);
  
  // Handle loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your healthcare practice performance
            </p>
          </div>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Handle error state  
  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your healthcare practice performance
            </p>
          </div>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                <p>Failed to load analytics data. Please try again later.</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if we have data
  const hasData = analyticsData && 
    (analyticsData.patientTrends.length > 0 || 
     analyticsData.appointmentData.length > 0 || 
     analyticsData.patientDemographics.length > 0);

  // If no data is available
  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your healthcare practice performance
            </p>
          </div>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p>No analytics data available for the selected timeframe.</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
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
              <div className="text-2xl font-bold">
                {analyticsData.overviewStats.totalPatients.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                {analyticsData.overviewStats.patientsGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{analyticsData.overviewStats.patientsGrowth.toFixed(1)}% from last {timeframe}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No change from last {timeframe}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Appointments</CardTitle>
              <CalendarRange className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overviewStats.appointments.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                {analyticsData.overviewStats.appointmentsGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{analyticsData.overviewStats.appointmentsGrowth.toFixed(1)}% from last {timeframe}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No change from last {timeframe}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Charting Rate</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overviewStats.chartingRate.toFixed(1)}%
              </div>
              <div className="flex items-center mt-1">
                {analyticsData.overviewStats.chartingRateGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{analyticsData.overviewStats.chartingRateGrowth.toFixed(1)}% from last {timeframe}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No change from last {timeframe}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">CareCoins Generated</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overviewStats.careCoinsGenerated.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                {analyticsData.overviewStats.careCoinsGrowth > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs text-green-600">
                      +{analyticsData.overviewStats.careCoinsGrowth.toFixed(1)}% from last {timeframe}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No change from last {timeframe}
                  </span>
                )}
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
                        data={analyticsData.patientTrends}
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
                        data={analyticsData.appointmentData}
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
                          data={analyticsData.patientDemographics}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {analyticsData.patientDemographics.map((entry, index) => (
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
                          data={analyticsData.diagnosisData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {analyticsData.diagnosisData.map((entry, index) => (
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
                      <RadarChart outerRadius={90} data={analyticsData.providerPerformance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        {analyticsData.providerPerformance.length > 0 && 
                          Object.keys(analyticsData.providerPerformance[0])
                            .filter(key => key !== 'name')
                            .map((provider, index) => (
                              <Radar 
                                key={provider}
                                name={provider} 
                                dataKey={provider} 
                                stroke={COLORS[index % COLORS.length]} 
                                fill={COLORS[index % COLORS.length]} 
                                fillOpacity={0.6} 
                              />
                            ))
                        }
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
                      data={analyticsData.careCoinsData}
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
                
                {analyticsData.careCoinsData.length > 0 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Earned</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0).toLocaleString()} coins
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Total Spent</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {analyticsData.careCoinsData.reduce((sum, item) => sum + item.spent, 0).toLocaleString()} coins
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Current Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-health-600">
                            {(analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0) - 
                              analyticsData.careCoinsData.reduce((sum, item) => sum + item.spent, 0)).toLocaleString()} coins
                          </div>
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
                            <div className="text-sm font-medium">
                              {Math.round(analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0) * 0.582).toLocaleString()} coins
                            </div>
                            <div className="text-xs text-muted-foreground">(58.2%)</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Patient Outcomes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {Math.round(analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0) * 0.197).toLocaleString()} coins
                            </div>
                            <div className="text-xs text-muted-foreground">(19.7%)</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <PieChart className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Treatment Plans</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {Math.round(analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0) * 0.141).toLocaleString()} coins
                            </div>
                            <div className="text-xs text-muted-foreground">(14.1%)</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>Other Activities</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {Math.round(analyticsData.careCoinsData.reduce((sum, item) => sum + item.earned, 0) * 0.08).toLocaleString()} coins
                            </div>
                            <div className="text-xs text-muted-foreground">(8.0%)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
