
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface ProgressNoteTabProps {
  patientId: string;
}

const ProgressNoteTab: React.FC<ProgressNoteTabProps> = ({ patientId }) => {
  // Sample data
  const progressNotes = [
    {
      effectiveDate: '4/15/2025 13:32',
      type: 'eMAR - Medication Administration Note',
      note: 'ALPRAZolam Tablet 0.25 MG Give 2 tablet by mouth.',
      careItem: '',
      dept: 'Nursing',
      shiftReport: 'N',
      hourReport: 'N'
    },
    {
      effectiveDate: '4/15/2025 12:39',
      type: 'eMAR - Medication Administration Note',
      note: 'Nicotine Polacrilex Mouth/Throat Gum 2 MG Give 1',
      careItem: '',
      dept: 'Nursing',
      shiftReport: 'N',
      hourReport: 'N'
    },
    {
      effectiveDate: '4/15/2025 11:24',
      type: 'eMAR - Medication Administration Note',
      note: 'Nicotine Polacrilex Mouth/Throat Gum 2 MG Give 1',
      careItem: '',
      dept: 'Nursing',
      shiftReport: 'N',
      hourReport: 'N'
    },
    {
      effectiveDate: '4/15/2025 09:17',
      type: 'eMAR - Medication Administration Note',
      note: 'Nicotine Polacrilex Mouth/Throat Gum 2 MG Give 1 [refused]',
      careItem: '',
      dept: 'Nursing',
      shiftReport: 'N',
      hourReport: 'N'
    },
    {
      effectiveDate: '4/15/2025 09:13',
      type: 'eMAR - Medication Administration Note',
      note: 'Nicotine Polacrilex Mouth/Throat Gum 2 MG Give 1 [refused]',
      careItem: '',
      dept: 'Nursing',
      shiftReport: 'N',
      hourReport: 'N'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(progressNotes, 'progress-notes');
  };

  const handleExportPdf = () => {
    exportToPdf('Progress Notes', progressNotes);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <h2 className="text-lg font-semibold">Progress Notes</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
          <Button variant="outline" size="sm">
            Set as Default
          </Button>
        </div>
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
      
      <div className="bg-muted/50 p-4 rounded-md">
        <div className="flex items-center">
          <input type="checkbox" id="display-emar" className="mr-2" checked />
          <label htmlFor="display-emar">Display eMAR Progress Notes</label>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Effective Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Care Plan Item or Task</TableHead>
            <TableHead>Dept</TableHead>
            <TableHead>Shift Report</TableHead>
            <TableHead>24 Hour Report</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {progressNotes.map((note, index) => (
            <TableRow key={index}>
              <TableCell>{note.effectiveDate}</TableCell>
              <TableCell>{note.type}</TableCell>
              <TableCell>{note.note}</TableCell>
              <TableCell>{note.careItem}</TableCell>
              <TableCell>{note.dept}</TableCell>
              <TableCell>{note.shiftReport}</TableCell>
              <TableCell>{note.hourReport}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProgressNoteTab;
