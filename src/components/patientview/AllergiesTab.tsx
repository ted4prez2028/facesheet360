
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileSpreadsheet, FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useAllergies } from '@/hooks/useAllergies';
import AllergyForm from './AllergyForm';

interface LocalAllergy {
  id: string;
  allergen: string;
  type: string;
  category: string;
  reaction: string;
  severity: string;
  date_identified: string;
  status: string;
  [key: string]: any;
}

interface AllergiesTabProps {
  patientId: string;
}

const AllergiesTab: React.FC<AllergiesTabProps> = ({ patientId }) => {
  const { allergies, isLoading, addAllergy, updateAllergy, deleteAllergy } = useAllergies(patientId);
  const [isAddAllergyOpen, setIsAddAllergyOpen] = useState(false);
  const [selectedAllergy, setSelectedAllergy] = useState<LocalAllergy | null>(null);
  const [isEditAllergyOpen, setIsEditAllergyOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleExportExcel = () => {
    exportToExcel(allergies, 'patient-allergies');
  };

  const handleExportPdf = () => {
    exportToPdf('Patient Allergies Report', allergies);
  };

  const handleEditClick = (allergy: any) => {
    const localAllergy: LocalAllergy = {
      id: allergy.id,
      allergen: allergy.allergen,
      type: allergy.type || 'Allergy',
      category: allergy.category || 'Drug',
      reaction: allergy.reaction,
      severity: allergy.severity,
      date_identified: allergy.date_identified,
      status: allergy.status
    };
    setSelectedAllergy(localAllergy);
    setIsEditAllergyOpen(true);
  };

  const handleDeleteClick = (allergy: any) => {
    const localAllergy: LocalAllergy = {
      id: allergy.id,
      allergen: allergy.allergen,
      type: allergy.type || 'Allergy',
      category: allergy.category || 'Drug',
      reaction: allergy.reaction,
      severity: allergy.severity,
      date_identified: allergy.date_identified,
      status: allergy.status
    };
    setSelectedAllergy(localAllergy);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAllergy) {
      await deleteAllergy(selectedAllergy.id);
      setIsDeleteDialogOpen(false);
      setSelectedAllergy(null);
    }
  };

  const handleAddSuccess = () => {
    setIsAddAllergyOpen(false);
  };

  const handleEditSuccess = () => {
    setIsEditAllergyOpen(false);
    setSelectedAllergy(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Allergies</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Dialog open={isAddAllergyOpen} onOpenChange={setIsAddAllergyOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Allergy</DialogTitle>
              </DialogHeader>
              <AllergyForm patientId={patientId} onSuccess={handleAddSuccess} />
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
              <TableHead>Allergen</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reaction Manifestation</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allergies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No allergies recorded
                </TableCell>
              </TableRow>
            ) : (
              allergies.map((allergy) => (
                <TableRow key={allergy.id}>
                  <TableCell>{allergy.allergen}</TableCell>
                  <TableCell>Allergy</TableCell>
                  <TableCell>{allergy.category || 'Drug'}</TableCell>
                  <TableCell>{allergy.reaction}</TableCell>
                  <TableCell>{allergy.severity}</TableCell>
                  <TableCell>{allergy.date_identified}</TableCell>
                  <TableCell>{allergy.status}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(allergy)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(allergy)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Edit Allergy Dialog */}
      <Dialog open={isEditAllergyOpen} onOpenChange={setIsEditAllergyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Allergy</DialogTitle>
          </DialogHeader>
          {selectedAllergy && (
            <AllergyForm 
              patientId={patientId}
              allergy={{
                ...selectedAllergy,
                patient_id: patientId
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this allergy record?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllergiesTab;
