
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FilePdf } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface Immunization {
  vaccine: string;
  cvxCode: string;
  dateAdministered?: string;
  status: string;
  source: string;
}

interface ImmunizationsProps {
  immunizations: Immunization[];
}

const Immunizations: React.FC<ImmunizationsProps> = ({ immunizations }) => {
  const handleExportExcel = () => {
    exportToExcel(immunizations, 'immunizations');
  };

  const handleExportPdf = () => {
    exportToPdf('Immunizations Record', immunizations);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <FilePdf className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccine</TableHead>
            <TableHead>CVX Code</TableHead>
            <TableHead>Date Administered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {immunizations.map((immunization, index) => (
            <TableRow key={`${immunization.cvxCode}-${index}`}>
              <TableCell>{immunization.vaccine}</TableCell>
              <TableCell>{immunization.cvxCode}</TableCell>
              <TableCell>{immunization.dateAdministered || '-'}</TableCell>
              <TableCell>{immunization.status}</TableCell>
              <TableCell>{immunization.source}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Immunizations;
