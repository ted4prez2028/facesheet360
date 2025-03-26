
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Check, AlertTriangle } from "lucide-react";
import PatientFormFields from "./PatientFormFields";
import PatientFacialCapture from "./PatientFacialCapture";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AddPatientDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientAdded: () => void;
}

export const AddPatientDrawer: React.FC<AddPatientDrawerProps> = ({
  open,
  onOpenChange,
  onPatientAdded,
}) => {
  const { isAuthenticated } = useAuth();
  
  const {
    formState,
    updateField,
    handleFacialDataCapture,
    resetForm,
    submitForm,
  } = usePatientForm(() => {
    onPatientAdded();
    onOpenChange(false);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-auto">
        <DrawerHeader>
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
        
        <form onSubmit={handleSubmit} className="px-4">
          <PatientFormFields
            formData={formState}
            onChange={updateField}
          />
          
          <PatientFacialCapture
            facialData={formState.facialData}
            onCapture={handleFacialDataCapture}
          />
          
          <DrawerFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              type="submit" 
              className="w-full sm:w-auto flex items-center" 
              disabled={formState.isLoading || !isAuthenticated}
            >
              <Check className="mr-2 h-4 w-4" />
              {formState.isLoading ? "Adding Patient..." : "Submit Patient"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
