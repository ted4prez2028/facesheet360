import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import PatientList from "@/components/charting/PatientList";
import PatientChart from "@/components/charting/PatientChart";
import AddPatientSheet from "@/components/charting/AddPatientSheet";
import { usePatientSelection } from "@/hooks/usePatientSelection";

const PatientManagement = () => {
  const { user } = useAuth();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  const { 
    selectedPatient, 
    setSelectedPatient, 
    selectedPatientData,
    patients,
    isLoading
  } = usePatientSelection(user?.id);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
        {/* Show patient list only when no patient is selected */}
        {!selectedPatient && (
          <div className="w-full flex flex-col">
            <PatientList 
              selectedPatient={selectedPatient}
              setSelectedPatient={(id) => setSelectedPatient(id)}
              setIsAddPatientOpen={setIsAddPatientOpen}
              user={user as any}
              patients={patients}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {/* Show patient chart when a patient is selected */}
        {selectedPatient && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="mb-4">
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                ← Back to Patients
              </button>
            </div>
            <PatientChart 
              selectedPatient={selectedPatient}
              patientData={selectedPatientData}
              userId={user?.id}
            />
          </div>
        )}
      </div>

      <AddPatientSheet 
        isOpen={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        user={user as any}
      />
    </>
  );
};

export default PatientManagement;