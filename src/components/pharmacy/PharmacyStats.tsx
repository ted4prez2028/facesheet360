
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, CheckCircle, Clock, Users } from "lucide-react";

interface PharmacyStatsProps {
  pendingCount: number;
  filledCount: number;
  totalPatients: number;
}

export const PharmacyStats = ({ pendingCount, filledCount, totalPatients }: PharmacyStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pending Prescriptions</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Filled Today</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{filledCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPatients}</div>
          <p className="text-xs text-muted-foreground mt-1">With prescriptions</p>
        </CardContent>
      </Card>
    </div>
  );
};
