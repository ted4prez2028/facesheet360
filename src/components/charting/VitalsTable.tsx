
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface VitalSign {
  id: string;
  date: string;
  temperature?: number;
  heartRate?: number;
  bloodPressure?: string;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

interface VitalsTableProps {
  vitals?: VitalSign[];
}

export const VitalsTable: React.FC<VitalsTableProps> = ({ vitals = [] }) => {
  if (!vitals || vitals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-muted-foreground">No vital signs recorded for this patient.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Signs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Temperature</TableHead>
              <TableHead>Heart Rate</TableHead>
              <TableHead>Blood Pressure</TableHead>
              <TableHead>Respiratory Rate</TableHead>
              <TableHead>O2 Saturation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vitals.map((vital) => (
              <TableRow key={vital.id}>
                <TableCell>{vital.date}</TableCell>
                <TableCell>{vital.temperature ? `${vital.temperature}°C` : '-'}</TableCell>
                <TableCell>{vital.heartRate ? `${vital.heartRate} bpm` : '-'}</TableCell>
                <TableCell>{vital.bloodPressure || '-'}</TableCell>
                <TableCell>{vital.respiratoryRate ? `${vital.respiratoryRate} breaths/min` : '-'}</TableCell>
                <TableCell>{vital.oxygenSaturation ? `${vital.oxygenSaturation}%` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
