
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PatientFormFields from "./PatientFormFields";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface AddPatientDrawerProps {
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onPatientAdded: () => void;
}

export const AddPatientDrawer: React.FC<AddPatientDrawerProps> = ({
  open,
  onOpenChange,
  onPatientAdded,
}) => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  const {
    formState,
    updateField,
    resetForm,
    submitForm,
  } = usePatientForm(() => {
    onOpenChange(false);
    onPatientAdded();
    toast({
      title: "Patient added",
      description: "Patient has been added successfully",
    });
  });

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to add patients."
      });
      return;
    }
    
    console.log("Submitting patient form with data:", formState);
    await submitForm();
  };
  
  const handleSavePatient = () => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "You must be logged in to add patients."
      });
      return;
    }
    
    submitForm();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="pb-4">
          <DrawerTitle>Add New Patient</DrawerTitle>
          <DrawerDescription>
            Fill in the patient details below. Fields marked with * are required.
          </DrawerDescription>
        </DrawerHeader>
        
        {!isAuthenticated && (
          <div className="px-4 mb-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to add patients. Please log in with your account credentials.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmitPatient} className="px-4 space-y-6">
          <PatientFormFields
            formData={formState}
            onChange={updateField}
            onSave={isAuthenticated ? handleSavePatient : undefined}
            isLoading={formState.isLoading}
          />
          
          <DrawerFooter className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={!isAuthenticated || formState.isLoading}
            >
              {formState.isLoading ? "Saving..." : "Save Patient"}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose} 
              className="w-full"
            >
              Cancel
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default AddPatientDrawer;
