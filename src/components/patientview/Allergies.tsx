
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Plus, Pencil, Trash } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useAllergies, Allergy } from '@/hooks/useAllergies';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AllergyForm from './AllergyForm';

interface AllergiesProps {
  patientId: string;
}

const Allergies: React.FC<AllergiesProps> = ({ patientId }) => {
  const { allergies, isLoading, deleteAllergy } = useAllergies(patientId);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedAllergy, setSelectedAllergy] = React.useState<Allergy | null>(null);

  const handleExportExcel = () => {
    const formattedData = allergies.map(allergy => ({
      Allergen: allergy.allergen,
      Reaction: allergy.reaction,
      Severity: allergy.severity,
      DateIdentified: allergy.date_identified,
      Status: allergy.status
    }));
    exportToExcel(formattedData, 'patient-allergies');
  };

  const handleExportPdf = () => {
    const formattedData = allergies.map(allergy => ({
      Allergen: allergy.allergen,
      Reaction: allergy.reaction,
      Severity: allergy.severity,
      DateIdentified: allergy.date_identified,
      Status: allergy.status
    }));
    exportToPdf('Patient Allergies', formattedData);
  };

  const handleEdit = (allergy: Allergy) => {
    setSelectedAllergy(allergy);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this allergy record?')) {
      await deleteAllergy(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="sm" onClick={() => setSelectedAllergy(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Allergy
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAllergy ? 'Edit Allergy' : 'Add New Allergy'}</DialogTitle>
            </DialogHeader>
            <AllergyForm 
              patientId={patientId}
              allergy={selectedAllergy}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Allergen</TableHead>
            <TableHead>Reaction</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Date Identified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : allergies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No allergies recorded</TableCell>
            </TableRow>
          ) : (
            allergies.map((allergy) => (
              <TableRow key={allergy.id}>
                <TableCell>{allergy.allergen}</TableCell>
                <TableCell>{allergy.reaction}</TableCell>
                <TableCell>{allergy.severity}</TableCell>
                <TableCell>{allergy.date_identified}</TableCell>
                <TableCell>{allergy.status}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(allergy)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(allergy.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Allergies;
