
import React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PatientFormFields from "./PatientFormFields";
import { PatientAvatarUpload } from "./PatientAvatarUpload";
import PatientFacialCapture from "./PatientFacialCapture";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [facialData, setFacialData] = useState<string | null>(null);
  
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
    await submitForm(avatarUrl, facialData);
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
    
    submitForm(avatarUrl, facialData);
  };

  const handleClose = () => {
    resetForm();
    setAvatarUrl(null);
    setFacialData(null);
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
          <div className="space-y-4">
            <div className="pb-4 border-b">
              <label className="text-sm font-medium mb-2 block">Patient Photo</label>
              <PatientAvatarUpload
                patientName={`${formState.firstName} ${formState.lastName}`.trim() || 'New Patient'}
                currentAvatarUrl={avatarUrl || undefined}
                onAvatarChange={setAvatarUrl}
              />
            </div>

            <div className="pb-4 border-b">
              <PatientFacialCapture
                facialData={facialData}
                onCapture={setFacialData}
              />
            </div>
            
            <PatientFormFields
              formData={formState}
              onChange={updateField}
              onSave={isAuthenticated ? handleSavePatient : undefined}
              isLoading={formState.isLoading}
            />
          </div>
          
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
