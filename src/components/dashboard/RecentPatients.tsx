
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Patient {
  id: number;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  status: string;
}

interface RecentPatientsProps {
  patients: Patient[];
}

const RecentPatients = ({ patients }: RecentPatientsProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Recent Patients</CardTitle>
      </CardHeader>
      <CardContent>
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
                    <Badge variant={patient.status === "Critical" ? "destructive" : "outline"}>
                      {patient.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">View</Button>
                      <Button size="sm" variant="outline">Chart</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPatients;
