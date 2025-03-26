
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import PatientFormFields from "@/components/patients/PatientFormFields";
import PatientFacialCapture from "@/components/patients/PatientFacialCapture";
import { usePatientForm } from "@/hooks/usePatientForm";
import { useToast } from "@/hooks/use-toast";
import PatientList from "@/components/charting/PatientList";
import PatientChart from "@/components/charting/PatientChart";

const Charting = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  const { data: patients } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      // Data fetching is now in the PatientList component
      // This query is kept here to access patient data for the selected patient
      const { data, error } = await fetch('/api/patients').then(res => res.json());
      if (error) throw error;
      return data;
    },
    enabled: false // Disable this query as it's handled in PatientList component
  });
  
  const selectedPatientData = patients?.find(p => p.id === selectedPatient);

  const {
    formState,
    updateField,
    handleFacialDataCapture,
    resetForm,
    submitForm,
  } = usePatientForm(() => {
    setIsAddPatientOpen(false);
    toast({
      title: "Patient added",
      description: "Patient has been added successfully",
    });
  });

  const handleSubmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <>
      <DashboardLayout>
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
          <div className="w-full md:w-80 flex flex-col">
            <PatientList 
              selectedPatient={selectedPatient}
              setSelectedPatient={(id) => setSelectedPatient(id)}
              setIsAddPatientOpen={setIsAddPatientOpen}
              user={user}
            />
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            <PatientChart 
              selectedPatient={selectedPatient}
              patientData={selectedPatientData}
              userId={user?.id}
            />
          </div>
        </div>
      </DashboardLayout>

      <Sheet open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add New Patient</SheetTitle>
            <SheetDescription>
              Fill in the patient details below. Fields marked with * are required.
            </SheetDescription>
          </SheetHeader>
          
          {!user && (
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
            />
            
            <PatientFacialCapture
              facialData={formState.facialData}
              onCapture={handleFacialDataCapture}
            />
            
            <SheetFooter className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button 
                type="submit" 
                className="w-full sm:w-auto flex items-center bg-health-600 hover:bg-health-700" 
                disabled={formState.isLoading || !user}
              >
                {formState.isLoading ? "Adding Patient..." : "Submit Patient"}
              </Button>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddPatientOpen(false);
                }} 
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Charting;
