import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCircle, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import StatisticsCards from "./StatisticsCards";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAdminStats } from "@/hooks/useAdminStats";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data: adminStats, isLoading } = useAdminStats();
  const { data: adminStats, isLoading } = useAdminStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide overview and management</p>
        </div>
        <Button 
          onClick={() => navigate("/carecoins-analytics")}
          className="bg-primary hover:bg-primary/90"
        >
          View CareCoins Analytics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{adminStats?.totalUsers.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {adminStats && adminStats.usersGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">+{adminStats.usersGrowth}%</span>
                    </>
                  ) : adminStats && adminStats.usersGrowth < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">{adminStats.usersGrowth}%</span>
                    </>
                  ) : (
                    <span>No change</span>
                  )}
                  {' '}from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{adminStats?.totalPatients.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground">Registered in system</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CareCoins in Circulation</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{adminStats?.careCoinsCirculation.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {adminStats && adminStats.careCoinsGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">+{adminStats.careCoinsGrowth}%</span>
                    </>
                  ) : adminStats && adminStats.careCoinsGrowth < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">{adminStats.careCoinsGrowth}%</span>
                    </>
                  ) : (
                    <span>No change</span>
                  )}
                  {' '}from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-custom-medium hover:shadow-custom-dark transition-shadow rounded-xl border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">${adminStats?.platformRevenue.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {adminStats && adminStats.revenueGrowth > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">+{adminStats.revenueGrowth}%</span>
                    </>
                  ) : adminStats && adminStats.revenueGrowth < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-600">{adminStats.revenueGrowth}%</span>
                    </>
                  ) : (
                    <span>No change</span>
                  )}
                  {' '}from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <StatisticsCards />
    </div>
  );
};

export default AdminDashboard;
