
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// This would typically come from an API call
const fetchAppointmentStats = async (timeframe = 'month') => {
  // Simulated data - in production, fetch from your API
  const monthData = [
    { name: 'Jan', scheduled: 45, completed: 40, cancelled: 5 },
    { name: 'Feb', scheduled: 52, completed: 48, cancelled: 4 },
    { name: 'Mar', scheduled: 49, completed: 43, cancelled: 6 },
    { name: 'Apr', scheduled: 63, completed: 58, cancelled: 5 },
    { name: 'May', scheduled: 55, completed: 52, cancelled: 3 },
    { name: 'Jun', scheduled: 71, completed: 65, cancelled: 6 },
  ];
  
  const weekData = [
    { name: 'Mon', scheduled: 12, completed: 11, cancelled: 1 },
    { name: 'Tue', scheduled: 15, completed: 14, cancelled: 1 },
    { name: 'Wed', scheduled: 18, completed: 17, cancelled: 1 },
    { name: 'Thu', scheduled: 14, completed: 13, cancelled: 1 },
    { name: 'Fri', scheduled: 16, completed: 14, cancelled: 2 },
    { name: 'Sat', scheduled: 8, completed: 7, cancelled: 1 },
    { name: 'Sun', scheduled: 5, completed: 4, cancelled: 1 },
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return timeframe === 'week' ? weekData : monthData;
};

const AppointmentStats = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month'>('month');
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['appointmentStats', timeframe],
    queryFn: () => fetchAppointmentStats(timeframe),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Statistics</CardTitle>
          <CardDescription>Loading appointment data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment Statistics</CardTitle>
          <CardDescription>Failed to load appointment data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] w-full text-muted-foreground">
            Error loading appointment statistics. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Appointment Statistics</CardTitle>
            <CardDescription>Overview of appointment trends</CardDescription>
          </div>
          <Tabs 
            defaultValue={timeframe} 
            value={timeframe}
            onValueChange={(value) => setTimeframe(value as 'week' | 'month')}
          >
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="scheduled" fill="#4f46e5" name="Scheduled" />
            <Bar dataKey="completed" fill="#10b981" name="Completed" />
            <Bar dataKey="cancelled" fill="#f43f5e" name="Cancelled" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AppointmentStats;
