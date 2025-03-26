
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PatientsList from "@/components/patients/PatientsList";
import PatientToolbar from "@/components/patients/PatientToolbar";
import AuthErrorAlert from "@/components/patients/AuthErrorAlert";
import { AddPatientDrawer } from "@/components/patients/AddPatientDrawer";
import FaceIdentificationDialog from "@/components/facial-recognition/FaceIdentificationDialog";
import { usePatientsPage } from "@/hooks/usePatientsPage";

const Patients = () => {
  const {
    isAddPatientOpen,
    setIsAddPatientOpen,
    searchQuery,
    setSearchQuery,
    isFaceIdDialogOpen,
    setIsFaceIdDialogOpen,
    patients,
    isLoading,
    error,
    refetch,
    handleIdentifyPatient,
    handleDeletePatient,
    filteredPatients,
    isAuthenticated
  } = usePatientsPage();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patients and their information.
          </p>
        </div>
        
        <AuthErrorAlert 
          isAuthenticated={isAuthenticated} 
          error={error} 
          refetch={refetch} 
        />
        
        <PatientToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsAddPatientOpen={setIsAddPatientOpen}
          setIsFaceIdDialogOpen={setIsFaceIdDialogOpen}
          isAuthenticated={isAuthenticated}
        />

        <PatientsList 
          patients={patients}
          filteredPatients={filteredPatients}
          isLoading={isLoading}
          error={error}
          handleDeletePatient={handleDeletePatient}
        />
      </div>

      <AddPatientDrawer
        open={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        onPatientAdded={() => {
          refetch();
        }}
      />

      <FaceIdentificationDialog
        isOpen={isFaceIdDialogOpen}
        onClose={() => setIsFaceIdDialogOpen(false)}
        onIdentificationSuccess={handleIdentifyPatient}
      />
    </DashboardLayout>
  );
};

export default Patients;
