
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface MdsTabProps {
  patientId: string;
}

const MdsTab: React.FC<MdsTabProps> = ({ patientId }) => {
  // Sample data
  const mdsData = [
    {
      date: '6/11/2025',
      description: 'Quarterly - None PPS',
      status: 'In Progress',
      pdpmHipps: '',
      insRug: '',
      stateRugStateHipps: '',
      createdBy: 'melinda.smith'
    },
    {
      date: '3/25/2025',
      description: 'Quarterly - None PPS',
      status: 'Accepted',
      pdpmHipps: '',
      insRug: '',
      stateRugStateHipps: '',
      createdBy: 'melinda.smith'
    },
    {
      date: '12/3/2024',
      description: 'Quarterly - None PPS',
      status: 'Accepted',
      pdpmHipps: '',
      insRug: '',
      stateRugStateHipps: '',
      createdBy: 'melinda.smith'
    },
    {
      date: '9/24/2024',
      description: 'Admission - None PPS',
      status: 'Accepted',
      pdpmHipps: '',
      insRug: '',
      stateRugStateHipps: '',
      createdBy: 'melinda.smith'
    },
    {
      date: '9/17/2024',
      description: 'Entry',
      status: 'Accepted',
      pdpmHipps: '',
      insRug: '',
      stateRugStateHipps: '',
      createdBy: 'melinda.smith'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(mdsData, 'mds-records');
  };

  const handleExportPdf = () => {
    exportToPdf('MDS Records', mdsData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">MDS 3.0 Kardex</h2>
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
            New
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Next Tckng/Dschrg: Next Full: ARD 9/25/2025</p>
            <p className="text-sm text-muted-foreground">Complete by: 10/9/2025 - 177 days</p>
          </div>
          <div>
            <p className="text-sm font-medium">Next Qtrly: ARD (Q3) 6/24/2025</p>
            <p className="text-sm text-muted-foreground">Complete by: 7/9/2025 - 85 days</p>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium">MDS Admission Date: 9/17/2024</p>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>PDPM HIPPS</TableHead>
            <TableHead>INS RUG</TableHead>
            <TableHead>State RUG/State HIPPS</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mdsData.map((record, index) => (
            <TableRow key={index}>
              <TableCell>{record.date}</TableCell>
              <TableCell>{record.description}</TableCell>
              <TableCell>{record.status}</TableCell>
              <TableCell>{record.pdpmHipps}</TableCell>
              <TableCell>{record.insRug}</TableCell>
              <TableCell>{record.stateRugStateHipps}</TableCell>
              <TableCell>{record.createdBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MdsTab;
