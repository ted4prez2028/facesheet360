
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRecentPatients, RecentPatient } from "@/hooks/useRecentPatients";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface RecentPatientsProps {
  patients?: RecentPatient[];
  isLoading?: boolean;
}

const RecentPatients = ({ patients: propPatients, isLoading: propIsLoading }: RecentPatientsProps) => {
  const navigate = useNavigate();
  const { data: fetchedPatients, isLoading } = useRecentPatients(5);
  
  // Use provided patients if available, otherwise use fetched data
  const patients = propPatients || fetchedPatients || [];
  const loading = propIsLoading !== undefined ? propIsLoading : isLoading;
  
  const getBadgeVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'critical':
        return "destructive";
      case 'follow-up':
        return "secondary";
      default:
        return "outline";
    }
  };
  
  const handleViewPatient = (id: string) => {
    navigate(`/patients/${id}`);
  };
  
  const handleChartPatient = (id: string) => {
    navigate('/charting');
    // We'll rely on SessionStorage to handle passing the selected patient ID
    sessionStorage.setItem('selectedPatientId', id);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Age</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Condition</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Last Visit</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">{patient.name}</td>
                    <td className="py-3 px-4">{patient.age}</td>
                    <td className="py-3 px-4">{patient.condition}</td>
                    <td className="py-3 px-4">{patient.lastVisit}</td>
                    <td className="py-3 px-4">
                      <Badge variant={getBadgeVariant(patient.status)}>
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewPatient(patient.id)}>View</Button>
                        <Button size="sm" variant="outline" onClick={() => handleChartPatient(patient.id)}>Chart</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No recent patients found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentPatients;
