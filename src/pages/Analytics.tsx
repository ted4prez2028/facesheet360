
// Create a new analytics page
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePatientStatistics, useAppointmentStatistics, usePatientDemographics, useCareCoinsAnalytics } from '@/hooks/useAnalyticsData';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('year');
  
  const { data: patientStats = [], isLoading: isPatientStatsLoading } = usePatientStatistics(timeframe);
  const { data: appointmentStats = [], isLoading: isAppointmentStatsLoading } = useAppointmentStatistics(timeframe);
  const { data: demographics = [], isLoading: isDemographicsLoading } = usePatientDemographics();
  const { data: careCoinsData = [], isLoading: isCareCoinsLoading } = useCareCoinsAnalytics(timeframe);
  
  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track key metrics and trends for your healthcare practice.</p>
        </div>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Performance Metrics</h2>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'quarter' | 'year')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="patients">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="patients">Patient Trends</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="carecoins">CareCoins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={patientStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Patients" />
                    <Line type="monotone" dataKey="newPatients" stroke="#82ca9d" name="New Patients" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={appointmentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#8884d8" name="Completed" />
                    <Bar dataKey="scheduled" fill="#82ca9d" name="Scheduled" />
                    <Bar dataKey="cancelled" fill="#ff8042" name="Cancelled" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="demographics">
            <Card>
              <CardHeader>
                <CardTitle>Patient Demographics</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="male" fill="#8884d8" name="Male" />
                    <Bar dataKey="female" fill="#82ca9d" name="Female" />
                    <Bar dataKey="other" fill="#ffc658" name="Other" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="carecoins">
            <Card>
              <CardHeader>
                <CardTitle>CareCoins Analytics</CardTitle>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={careCoinsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="earned" stroke="#8884d8" name="Earned" />
                    <Line type="monotone" dataKey="spent" stroke="#82ca9d" name="Spent" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default Analytics;
