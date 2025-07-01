
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Plus, MoreHorizontal } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Immunization {
  vaccine: string;
  cvxCode: string;
  dateAdministered?: string;
  status: string;
  source: string;
  [key: string]: any;
}

interface ImmunizationsTabProps {
  patientId: string;
}

const ImmunizationsTab: React.FC<ImmunizationsTabProps> = ({ patientId }) => {
  const [isAddImmunizationOpen, setIsAddImmunizationOpen] = useState(false);
  
  // Sample data based on the screenshot
  const immunizationsData: Immunization[] = [
    {
      vaccine: 'Pneumococcal PCV13',
      cvxCode: '133',
      status: 'Refused',
      source: 'System'
    },
    {
      vaccine: 'Influenza (standard dose syringe)',
      cvxCode: '201',
      status: 'Refused',
      source: 'System'
    },
    {
      vaccine: 'RSVPreF3 (Abrysvo)',
      cvxCode: '93',
      status: 'Refused',
      source: 'System'
    },
    {
      vaccine: 'Moderna COVID-19 Vaccine',
      cvxCode: '207',
      status: 'Refused',
      source: 'System'
    },
    {
      vaccine: 'TB 1 Step Mantoux (PPD)',
      cvxCode: '96',
      status: 'Refused',
      source: 'System'
    },
    {
      vaccine: 'T dap',
      cvxCode: '996',
      dateAdministered: '11/16/2024',
      status: 'Complete',
      source: 'System'
    }
  ];

  const handleExportExcel = () => {
    exportToExcel(immunizationsData, 'immunizations');
  };

  const handleExportPdf = () => {
    exportToPdf('Immunizations Record', immunizationsData);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Immunizations</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddImmunizationOpen} onOpenChange={setIsAddImmunizationOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Immunization</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="vaccine-name">Vaccine</Label>
                  <Select>
                    <SelectTrigger id="vaccine-name">
                      <SelectValue placeholder="Select vaccine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pneumococcal">Pneumococcal PCV13</SelectItem>
                      <SelectItem value="influenza">Influenza (standard dose syringe)</SelectItem>
                      <SelectItem value="covid">Moderna COVID-19 Vaccine</SelectItem>
                      <SelectItem value="tdap">T dap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-administered">Date Administered</Label>
                  <Input id="date-administered" type="date" />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="refused">Refused</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddImmunizationOpen(false)}>Cancel</Button>
                <Button>Add Immunization</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vaccine</TableHead>
            <TableHead>CVX Code</TableHead>
            <TableHead>Date Administered</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {immunizationsData.map((immunization, index) => (
            <TableRow key={`${immunization.cvxCode}-${index}`}>
              <TableCell>{immunization.vaccine}</TableCell>
              <TableCell>{immunization.cvxCode}</TableCell>
              <TableCell>{immunization.dateAdministered || '-'}</TableCell>
              <TableCell>{immunization.status}</TableCell>
              <TableCell>{immunization.source}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Record</DropdownMenuItem>
                    <DropdownMenuItem>Print Certificate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImmunizationsTab;
