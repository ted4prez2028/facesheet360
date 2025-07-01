
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface Diagnosis {
  code: string;
  description: string;
  category: string;
  date: string;
  rank: string;
  classification: string;
  createdDate: string;
  createdBy: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

interface MedicalDiagnosisProps {
  diagnoses: Diagnosis[];
}

const MedicalDiagnosis: React.FC<MedicalDiagnosisProps> = ({ diagnoses }) => {
  const handleExportExcel = () => {
    exportToExcel(diagnoses, 'medical-diagnoses');
  };

  const handleExportPdf = () => {
    exportToPdf('Medical Diagnoses', diagnoses);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportPdf}>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Clinical Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Classification</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {diagnoses.map((diagnosis, index) => (
            <TableRow key={`${diagnosis.code}-${index}`}>
              <TableCell>{diagnosis.code}</TableCell>
              <TableCell>{diagnosis.description}</TableCell>
              <TableCell>{diagnosis.category}</TableCell>
              <TableCell>{diagnosis.date}</TableCell>
              <TableCell>{diagnosis.rank}</TableCell>
              <TableCell>{diagnosis.classification}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MedicalDiagnosis;
