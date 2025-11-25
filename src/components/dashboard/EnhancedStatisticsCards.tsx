/**
 * Enhanced Statistics Cards with Animations and Trends
 */

import React, { useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, ClipboardList, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: number;
  isRefetching: boolean;
}

const StatCard = memo(({ title, value, icon, trend, isRefetching }: StatCardProps) => {
  const getTrendIcon = () => {
    if (!trend || trend === 0) return <Minus className="h-3 w-3" />;
    return trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend || trend === 0) return 'text-muted-foreground';
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          {isRefetching && (
            <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold mb-2">
          {value.toLocaleString()}
        </div>
        
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="font-medium">
              {Math.abs(trend)}% from last month
            </span>
          </div>
        )}

        <Badge variant="secondary" className="mt-2 text-xs">
          Real-time
        </Badge>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const EnhancedStatisticsCards = () => {
  const { data: dashboardData, isLoading, isRefetching } = useDashboardData();
  const [_trends, _setTrends] = useState({ patients: 5, appointments: 12, tasks: -3, coins: 8 });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Patients"
        value={dashboardData?.activePatients || 0}
        icon={<Users className="h-5 w-5 text-primary" />}
        trend={trends.patients}
        isRefetching={isRefetching}
      />
      
      <StatCard
        title="Today's Appointments"
        value={dashboardData?.todayAppointments || 0}
        icon={<Calendar className="h-5 w-5 text-primary" />}
        trend={trends.appointments}
        isRefetching={isRefetching}
      />
      
      <StatCard
        title="Pending Tasks"
        value={dashboardData?.pendingTasks || 0}
        icon={<ClipboardList className="h-5 w-5 text-primary" />}
        trend={trends.tasks}
        isRefetching={isRefetching}
      />
      
      <StatCard
        title="CareCoins Balance"
        value={dashboardData?.careCoinsEarned || 0}
        icon={<Activity className="h-5 w-5 text-primary" />}
        trend={trends.coins}
        isRefetching={isRefetching}
      />
    </div>
  );
};

export default memo(EnhancedStatisticsCards);
