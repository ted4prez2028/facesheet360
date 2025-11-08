import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import PatientList from "@/components/charting/PatientList";
import UnifiedPatientInterface from "@/components/charting/UnifiedPatientInterface";
import AddPatientSheet from "@/components/charting/AddPatientSheet";
import { usePatientSelection } from "@/hooks/usePatientSelection";

const PatientManagement = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<string | undefined>();
  
  const { 
    selectedPatient, 
    setSelectedPatient, 
    selectedPatientData,
    patients,
    isLoading
  } = usePatientSelection(user?.id);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setInitialTab(tab);
      // Clear the tab parameter from URL after using it
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('tab');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="h-full overflow-hidden">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Show patient list only when no patient is selected */}
        {!selectedPatient && (
          <div className="w-full flex flex-col overflow-hidden">
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
        
        {/* Show unified patient interface when a patient is selected */}
        {selectedPatient && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <UnifiedPatientInterface 
              selectedPatient={selectedPatient}
              patientData={selectedPatientData}
              userId={user?.id}
              onBack={() => setSelectedPatient(null)}
              initialTab={initialTab}
            />
          </div>
        )}
      </div>

      <AddPatientSheet 
        isOpen={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        user={user as any}
      />
    </div>
  );
};

export default PatientManagement;