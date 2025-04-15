
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface CarePlanTabProps {
  patientId: string;
}

const CarePlanTab: React.FC<CarePlanTabProps> = ({ patientId }) => {
  // Sample data for CAA table
  const caaData = [
    {
      name: 'Functional Abilities (Self-Care and Mobility)',
      triggered: 'Y'
    },
    {
      name: 'Urinary Incontinence and Indwelling Catheter',
      triggered: 'Y'
    },
    {
      name: 'Falls',
      triggered: 'Y'
    },
    {
      name: 'Nutritional Status',
      triggered: 'Y'
    },
    {
      name: 'Pressure Ulcer/Injury',
      triggered: 'Y'
    },
    {
      name: 'Psychotropic Drug Use',
      triggered: 'Y'
    },
    {
      name: 'Pain',
      triggered: 'Y'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(caaData, 'care-plan-caas');
  };

  const handleExportPdf = () => {
    exportToPdf('Care Plan CAAs', caaData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Care Plan</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Care Plan
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Care Areas Assessments (CAAs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CAA Name</TableHead>
                <TableHead>Triggered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caaData.map((caa, index) => (
                <TableRow key={index}>
                  <TableCell>{caa.name}</TableCell>
                  <TableCell>{caa.triggered}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Advanced Directives</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Date</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Revision Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>4/9/2025</TableCell>
                <TableCell>
                  DNAR - Do Not Attempt Resuscitation (Allow Natural Death) Comfort measures only
                </TableCell>
                <TableCell>Active</TableCell>
                <TableCell>4/9/2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Care Plan Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            <Button variant="outline" size="sm">Filter by Problem</Button>
            <Button size="sm">Add New Goal</Button>
          </div>
          
          <div className="p-8 text-center text-muted-foreground">
            <p>No care plan goals have been defined yet.</p>
            <p>Click "Add New Goal" to create a new care plan goal.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CarePlanTab;
