import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import PatientList from "@/components/charting/PatientList";
import AddPatientSheet from "@/components/charting/AddPatientSheet";
import { usePatientSelection } from "@/hooks/usePatientSelection";
import { usePatient } from "@/hooks/usePatient";
import PatientTabs from "@/components/patientview/PatientTabs";
import PatientHeader from "@/components/patientview/PatientHeader";
import { Spinner } from "@/components/ui/spinner";

const PatientManagement = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<string | undefined>();
  
  const { 
    selectedPatient, 
    setSelectedPatient, 
    patients,
    isLoading
  } = usePatientSelection(user?.id);

  const { patient: fullPatientData, isLoading: patientLoading } = usePatient(selectedPatient || '');

  // Handle URL parameter for patient ID
  useEffect(() => {
    if (id && id !== selectedPatient) {
      setSelectedPatient(id);
    }
  }, [id, selectedPatient, setSelectedPatient]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setInitialTab(tab);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('tab');
        return newParams;
      });
    }
  }, [searchParams, setSearchParams]);

  const calculateAge = (dateOfBirth: string) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleBackToList = () => {
    setSelectedPatient(null);
    if (id) {
      navigate('/patients');
    }
  };

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
          <div className="flex-1 flex flex-col h-full overflow-auto">
            {patientLoading ? (
              <div className="flex justify-center items-center h-96">
                <Spinner size="lg" />
              </div>
            ) : fullPatientData ? (
              <div className="container mx-auto px-4 py-8">
                <PatientHeader 
                  patient={fullPatientData} 
                  calculateAge={calculateAge}
                  onBack={handleBackToList}
                />
                <PatientTabs patientId={selectedPatient} />
              </div>
            ) : null}
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