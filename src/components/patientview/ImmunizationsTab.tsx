
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Plus, MoreHorizontal } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useImmunizations } from '@/hooks/useImmunizations';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ImmunizationsTabProps {
  patientId: string;
}

const ImmunizationsTab: React.FC<ImmunizationsTabProps> = ({ patientId }) => {
  const { user } = useAuth();
  const { immunizations, isLoading, addImmunization } = useImmunizations(patientId);
  const [isAddImmunizationOpen, setIsAddImmunizationOpen] = useState(false);
  const [vaccine, setVaccine] = useState('');
  const [cvxCode, setCvxCode] = useState('');
  const [dateAdministered, setDateAdministered] = useState('');
  const [status, setStatus] = useState('');

  const handleExportExcel = () => {
    exportToExcel(immunizations, 'immunizations');
  };

  const handleExportPdf = () => {
    exportToPdf('Immunizations Record', immunizations);
  };

  const handleAddImmunization = async () => {
    if (!vaccine || !status) {
      return;
    }

    await addImmunization.mutateAsync({
      patient_id: patientId,
      vaccine_name: vaccine,
      cvx_code: cvxCode,
      date_administered: dateAdministered || undefined,
      status,
      source: 'Manual Entry',
      administered_by: user?.id,
    });

    setVaccine('');
    setCvxCode('');
    setDateAdministered('');
    setStatus('');
    setIsAddImmunizationOpen(false);
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
                  <Input
                    id="vaccine-name"
                    placeholder="Enter vaccine name"
                    value={vaccine}
                    onChange={(e) => setVaccine(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cvx-code">CVX Code</Label>
                  <Input
                    id="cvx-code"
                    placeholder="Enter CVX code"
                    value={cvxCode}
                    onChange={(e) => setCvxCode(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="date-administered">Date Administered</Label>
                  <Input
                    id="date-administered"
                    type="date"
                    value={dateAdministered}
                    onChange={(e) => setDateAdministered(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Complete">Complete</SelectItem>
                      <SelectItem value="Refused">Refused</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddImmunizationOpen(false)}>Cancel</Button>
                <Button onClick={handleAddImmunization} disabled={addImmunization.isPending}>
                  Add Immunization
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
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
            {immunizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No immunization records found
                </TableCell>
              </TableRow>
            ) : (
              immunizations.map((immunization) => (
                <TableRow key={immunization.id}>
                  <TableCell>{immunization.vaccine_name}</TableCell>
                  <TableCell>{immunization.cvx_code || '-'}</TableCell>
                  <TableCell>{immunization.date_administered || '-'}</TableCell>
                  <TableCell>{immunization.status}</TableCell>
                  <TableCell>{immunization.source || 'System'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ImmunizationsTab;
