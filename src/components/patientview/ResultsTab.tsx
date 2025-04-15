
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface ResultsTabProps {
  patientId: string;
}

const ResultsTab: React.FC<ResultsTabProps> = ({ patientId }) => {
  // Sample data
  const labResults = [
    {
      flag: '',
      reportName: 'Anaerobic and Aerobic Culture',
      reportStatus: 'Completed',
      category: 'Microbiology, Unknown Category',
      collectionDate: '12/3/2024 14:00',
      reportedDate: '12/9/2024 13:50',
      reviewStatus: 'Reviewed'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(labResults, 'lab-results');
  };

  const handleExportPdf = () => {
    exportToPdf('Laboratory Results', labResults);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Results</h2>
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flag</TableHead>
            <TableHead>Report Name</TableHead>
            <TableHead>Report Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Collection Date</TableHead>
            <TableHead>Reported Date</TableHead>
            <TableHead>Review Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labResults.map((result, index) => (
            <TableRow key={index}>
              <TableCell>{result.flag}</TableCell>
              <TableCell>{result.reportName}</TableCell>
              <TableCell>{result.reportStatus}</TableCell>
              <TableCell>{result.category}</TableCell>
              <TableCell>{result.collectionDate}</TableCell>
              <TableCell>{result.reportedDate}</TableCell>
              <TableCell>{result.reviewStatus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTab;
