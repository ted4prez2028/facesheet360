
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardList, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";

const StatisticsCards = () => {
  const { data: dashboardData, isLoading } = useDashboardData();

  return (
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
  );
};

export default StatisticsCards;
