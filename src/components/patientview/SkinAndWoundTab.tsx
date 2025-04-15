
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface SkinAndWoundTabProps {
  patientId: string;
}

const SkinAndWoundTab: React.FC<SkinAndWoundTabProps> = ({ patientId }) => {
  const woundData = [];
  
  const handleExportExcel = () => {
    exportToExcel(woundData, 'skin-and-wound');
  };

  const handleExportPdf = () => {
    exportToPdf('Skin and Wound Report', woundData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Skin and Wound</h2>
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
            New Assessment
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Active Wounds</h3>
          <p className="text-muted-foreground">No active wounds found</p>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">Recent Assessments</h3>
          <p className="text-muted-foreground">No recent assessments found</p>
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-4">Wound History</h3>
        
        {woundData.length === 0 ? (
          <p className="text-muted-foreground">No wound history records found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wound ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Assessment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Wound data would go here */}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default SkinAndWoundTab;
