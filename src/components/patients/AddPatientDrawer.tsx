
import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, isAuthenticated } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!open) return;
      
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error("Authentication Required", {
            description: "You must be logged in to add patients."
          });
        }
        setIsAuthChecked(true);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthChecked(true);
      }
    };
    
    checkAuth();
  }, [open]);
  
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
    
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
        description: "You must be logged in to add patients."
      });
      return;
    }
    
    await submitForm();
  };
  
  const handleSavePatient = () => {
    if (!isAuthenticated) {
      toast.error("Authentication Required", {
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
            onSave={isAuthenticated ? handleSavePatient : undefined}
            isLoading={formState.isLoading}
          />
          
          <PatientFacialCapture
            facialData={formState.facialData}
            onCapture={handleFacialDataCapture}
          />
          
          <DrawerFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                Cancel
              </Button>
            </DrawerClose>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={!isAuthenticated || formState.isLoading}
            >
              {formState.isLoading ? "Saving..." : "Save Patient"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};
