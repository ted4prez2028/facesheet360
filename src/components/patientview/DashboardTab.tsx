
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardTabProps {
  patientId: string;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ patientId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient Overview</CardTitle>
          <CardDescription>Key metrics and recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Dashboard content will be implemented</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;
