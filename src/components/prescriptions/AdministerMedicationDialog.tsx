
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdministerPrescription } from "@/hooks/usePrescriptions";
import { Prescription } from "@/types";
import { CheckCircle, AlertCircle } from "lucide-react";

interface AdministerMedicationDialogProps {
  prescription: Prescription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdministerMedicationDialog = ({ 
  prescription, 
  isOpen, 
  onClose 
}: AdministerMedicationDialogProps) => {
  const { mutate: administerMedication, isPending } = useAdministerPrescription();

  const handleAdminister = () => {
    if (!prescription) return;
    
    administerMedication(prescription.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!prescription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Administer Medication</DialogTitle>
          <DialogDescription>
            Confirm that you're administering this medication to the patient.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Medication:</div>
              <div className="text-sm">{prescription.medication_name}</div>
              
              <div className="text-sm font-medium">Dosage:</div>
              <div className="text-sm">{prescription.dosage}</div>
              
              <div className="text-sm font-medium">Frequency:</div>
              <div className="text-sm">{prescription.frequency}</div>
              
              <div className="text-sm font-medium">Instructions:</div>
              <div className="text-sm">{prescription.instructions || "None"}</div>
            </div>
            
            <div className="flex items-center border p-3 rounded-md bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div className="text-sm">
                By administering this medication, you are confirming that you have verified the patient's identity and the correct medication details.
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAdminister}
            disabled={isPending}
            className="bg-health-600 hover:bg-health-700 text-white"
          >
            {isPending ? (
              "Processing..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm Administration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdministerMedicationDialog;
