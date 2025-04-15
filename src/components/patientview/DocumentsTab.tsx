
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus, FileDown } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface DocumentsTabProps {
  patientId: string;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ patientId }) => {
  // Sample data
  const documentsData = [
    {
      effectiveDate: '4/12/2025',
      documentName: 'SNF Wound Care.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '4/9/2025',
      documentName: 'Marijuana policy.pdf',
      category: 'Informed Consents'
    },
    {
      effectiveDate: '3/15/2025',
      documentName: 'Prime Mobile Dental.pdf',
      category: 'Physician Documents'
    },
    {
      effectiveDate: '3/12/2025',
      documentName: 'SNF Wound Care Progress Notes EYE Exam.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '3/12/2025',
      documentName: 'SNF Wound Care.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '3/9/2025',
      documentName: 'SNF Wound Care.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '3/5/2025',
      documentName: 'SNF Wound Care.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '3/19/2025',
      documentName: 'Nurses Note Signature Order.pdf',
      category: 'WoundCare Progress Notes'
    },
    {
      effectiveDate: '3/12/2025',
      documentName: 'SNF Follow up 2025-03-18.pdf',
      category: 'Progress Note'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(documentsData, 'patient-documents');
  };

  const handleExportPdf = () => {
    exportToPdf('Patient Documents', documentsData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Documents</h2>
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
            New Document
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Effective Date</TableHead>
            <TableHead>Document Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documentsData.map((document, index) => (
            <TableRow key={index}>
              <TableCell>{document.effectiveDate}</TableCell>
              <TableCell>{document.documentName}</TableCell>
              <TableCell>{document.category}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon">
                  <FileDown className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DocumentsTab;
