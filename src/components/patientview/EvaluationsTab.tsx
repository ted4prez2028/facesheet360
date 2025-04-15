
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface EvaluationsTabProps {
  patientId: string;
}

const EvaluationsTab: React.FC<EvaluationsTabProps> = ({ patientId }) => {
  // Sample data
  const evaluationsData = [
    {
      date: '4/14/2025',
      description: '"Complex Medicaid Add-On - OR V1.0',
      status: 'Complete',
      type: 'Other',
      category: '',
      score: '',
      createdBy: 'mackenzie.hercsten',
      revisedBy: ''
    },
    {
      date: '4/12/2025',
      description: 'Skin & Wound Evaluation V7.0',
      status: 'Complete',
      type: 'Other',
      category: '',
      score: '',
      createdBy: 'rebecca.isaksen',
      revisedBy: 'sarah.hampton'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(evaluationsData, 'evaluations');
  };

  const handleExportPdf = () => {
    exportToPdf('Evaluations', evaluationsData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Standard Evaluations</h2>
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
          <Button size="sm" variant="outline">
            Edit Schedules
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-md space-y-2">
        <p className="text-sm font-medium">Next Custom Schedule Evaluation Due: Pressure, Left Gluteus: 4 days - 4/19/2025</p>
        <p className="text-sm font-medium">Next Evaluation Due: "Nutrition at Risk (Pacific Shores and Oregon): 6 days - 4/21/2025</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Revised By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evaluationsData.map((evaluation, index) => (
            <TableRow key={index}>
              <TableCell>{evaluation.date}</TableCell>
              <TableCell>{evaluation.description}</TableCell>
              <TableCell>{evaluation.status}</TableCell>
              <TableCell>{evaluation.type}</TableCell>
              <TableCell>{evaluation.category}</TableCell>
              <TableCell>{evaluation.score}</TableCell>
              <TableCell>{evaluation.createdBy}</TableCell>
              <TableCell>{evaluation.revisedBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EvaluationsTab;
