
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';

interface CensusEntry {
  effectiveDate: string;
  primaryPayer: string;
  payerFile: string;
  status: string;
  actionCode: string;
  hipps: string;
  careLevel: string;
  location: string;
  [key: string]: any; // Index signature for DataItem compatibility
}

interface CensusTabProps {
  patientId: string;
}

const CensusTab: React.FC<CensusTabProps> = ({ patientId }) => {
  // Sample data based on the screenshot
  const censusData: CensusEntry[] = [
    {
      effectiveDate: '3/4/2025',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'N',
      status: 'Active',
      actionCode: 'RC',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #1 Floor 1 6-C 3 Bed Room'
    },
    {
      effectiveDate: '1/15/2025',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'N',
      status: 'Active',
      actionCode: 'RC',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #1 Floor 1 6-B Semi Private'
    },
    {
      effectiveDate: '12/4/2024',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'N',
      status: 'Active',
      actionCode: 'RER',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #3 Floor 1 29-B Semi Private'
    },
    {
      effectiveDate: '12/4/2024',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'N',
      status: 'Paid ER Visit',
      actionCode: 'ER',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #3 Floor 1 29-B Semi Private'
    },
    {
      effectiveDate: '10/1/2024',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'N',
      status: 'Active',
      actionCode: 'RC',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #3 Floor 1 29-B Semi Private'
    },
    {
      effectiveDate: '8/17/2024',
      primaryPayer: 'Medicaid OR Complex',
      payerFile: 'Y',
      status: 'Active',
      actionCode: 'AA',
      hipps: 'STD',
      careLevel: 'STD',
      location: 'Hall #3 Floor 1 29-B Semi Private'
    }
  ];

  const levelOfCareData = []; // This is empty based on the screenshot

  const handleExportExcel = () => {
    exportToExcel(censusData, 'patient-census');
  };

  const handleExportPdf = () => {
    exportToPdf('Patient Census Report', censusData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Census</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Effective Date</TableHead>
            <TableHead>Primary Payer</TableHead>
            <TableHead>Payer File</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action Code</TableHead>
            <TableHead>HIPPS</TableHead>
            <TableHead>Care Level</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {censusData.map((entry, index) => (
            <TableRow key={`${entry.effectiveDate}-${index}`}>
              <TableCell>{entry.effectiveDate}</TableCell>
              <TableCell>{entry.primaryPayer}</TableCell>
              <TableCell>{entry.payerFile}</TableCell>
              <TableCell>{entry.status}</TableCell>
              <TableCell>{entry.actionCode}</TableCell>
              <TableCell>{entry.hipps}</TableCell>
              <TableCell>{entry.careLevel}</TableCell>
              <TableCell>{entry.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Level of Care (LOC)</h2>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Effective From Date</TableHead>
              <TableHead>Effective Thru Date</TableHead>
              <TableHead>Skilled?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levelOfCareData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              levelOfCareData.map((entry, index) => (
                <TableRow key={index}>
                  {/* LOC data would go here */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CensusTab;
