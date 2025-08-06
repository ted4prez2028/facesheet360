
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardList, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Badge } from "@/components/ui/badge";

const StatisticsCards = () => {
  const { data: dashboardData, isLoading, isRefetching } = useDashboardData();
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    if (dashboardData) {
      setLastUpdate(new Date().toLocaleTimeString());
    }
  }, [dashboardData]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          <div className="flex items-center gap-2">
            {isRefetching && <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />}
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardData?.activePatients || 0}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Active in system
                </p>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
          <div className="flex items-center gap-2">
            {isRefetching && <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />}
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardData?.todayAppointments || 0}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Scheduled for today
                </p>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tasks Pending</CardTitle>
          <div className="flex items-center gap-2">
            {isRefetching && <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />}
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardData?.pendingTasks || 0}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">CareCoins Balance</CardTitle>
          <div className="flex items-center gap-2">
            {isRefetching && <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />}
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <>
              <div className="text-2xl font-bold">{dashboardData?.careCoinsEarned || 0}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Current balance
                </p>
                <Badge variant="secondary" className="text-xs">
                  Live
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
