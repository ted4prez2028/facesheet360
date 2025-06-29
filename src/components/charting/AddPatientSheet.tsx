
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PatientFormFields from "@/components/patients/PatientFormFields";
import PatientFacialCapture from "@/components/patients/PatientFacialCapture";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface AddPatientSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User | null;
}

const AddPatientSheet: React.FC<AddPatientSheetProps> = ({
  isOpen,
  onOpenChange,
  user,
}) => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!isOpen) return;
      
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
        
        if (!data.session) {
          toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "You must be logged in to add patients."
          });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [isOpen, toast]);
  
  const {
    formState,
    updateField,
    handleFacialDataCapture,
    resetForm,
    submitForm,
  } = usePatientForm(() => {
    onOpenChange(false);
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
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Add New Patient</SheetTitle>
          <SheetDescription>
            Fill in the patient details below. Fields marked with * are required.
          </SheetDescription>
        </SheetHeader>
        
        {!isAuthenticated && (
          <div className="mb-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You must be logged in to add patients. Please log in with your account credentials.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmitPatient} className="space-y-6">
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
          
          <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose} 
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={!isAuthenticated || formState.isLoading}
            >
              {formState.isLoading ? "Saving..." : "Save Patient"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default AddPatientSheet;
