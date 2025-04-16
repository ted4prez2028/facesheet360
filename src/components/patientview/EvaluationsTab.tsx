
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileSpreadsheet, FileText, Plus, Pencil, Trash } from 'lucide-react';
import { exportToExcel, exportToPdf } from '@/utils/exportUtils';
import { useEvaluations } from '@/hooks/useEvaluations';
import { useAuth } from '@/hooks/useAuth';

interface EvaluationsTabProps {
  patientId: string;
}

interface EvaluationFormData {
  description: string;
  type?: string;
  category?: string;
  score?: string;
  status: string;
}

const EvaluationsTab: React.FC<EvaluationsTabProps> = ({ patientId }) => {
  const { user } = useAuth();
  const { evaluations, isLoading, addEvaluation, updateEvaluation, deleteEvaluation } = useEvaluations(patientId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleExportExcel = () => {
    if (evaluations) {
      exportToExcel(evaluations, 'evaluations');
    }
  };

  const handleExportPdf = () => {
    if (evaluations) {
      exportToPdf('Evaluations', evaluations);
    }
  };

  const handleAddEvaluation = async (data: EvaluationFormData) => {
    if (!user?.id) return;

    await addEvaluation.mutateAsync({
      patient_id: patientId,
      created_by: user.id,
      ...data
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateEvaluation = async (data: EvaluationFormData) => {
    if (!selectedEvaluation || !user?.id) return;

    await updateEvaluation.mutateAsync({
      id: selectedEvaluation.id,
      revised_by: user.id,
      ...data
    });
    setIsEditDialogOpen(false);
    setSelectedEvaluation(null);
  };

  const handleDeleteClick = (evaluation: any) => {
    setSelectedEvaluation(evaluation);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedEvaluation) {
      await deleteEvaluation.mutateAsync(selectedEvaluation.id);
      setIsDeleteDialogOpen(false);
      setSelectedEvaluation(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Standard Evaluations</h2>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-muted/50 rounded-md space-y-2">
        <p className="text-sm font-medium">Next Custom Schedule Evaluation Due: Pressure, Left Gluteus: 4 days - 4/19/2025</p>
        <p className="text-sm font-medium">Next Evaluation Due: Nutrition at Risk (Pacific Shores and Oregon): 6 days - 4/21/2025</p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Revised By</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">Loading...</TableCell>
            </TableRow>
          ) : evaluations?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">No evaluations found</TableCell>
            </TableRow>
          ) : (
            evaluations?.map((evaluation) => (
              <TableRow key={evaluation.id}>
                <TableCell>{new Date(evaluation.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{evaluation.description}</TableCell>
                <TableCell>{evaluation.status}</TableCell>
                <TableCell>{evaluation.type || '-'}</TableCell>
                <TableCell>{evaluation.category || '-'}</TableCell>
                <TableCell>{evaluation.score || '-'}</TableCell>
                <TableCell>{evaluation.created_by || '-'}</TableCell>
                <TableCell>{evaluation.revised_by || '-'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setSelectedEvaluation(evaluation);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteClick(evaluation)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add/Edit Evaluation Dialog will be implemented here */}
      {/* Delete Confirmation Dialog will be implemented here */}
    </div>
  );
};

export default EvaluationsTab;
