
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import PatientList from "@/components/charting/PatientList";
import PatientChart from "@/components/charting/PatientChart";
import AddPatientSheet from "@/components/charting/AddPatientSheet";
import { usePatientSelection } from "@/hooks/usePatientSelection";

const Charting = () => {
  const { user } = useAuth();
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  const { 
    selectedPatient, 
    setSelectedPatient, 
    selectedPatientData 
  } = usePatientSelection(user?.id);

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

      <AddPatientSheet 
        isOpen={isAddPatientOpen}
        onOpenChange={setIsAddPatientOpen}
        user={user}
      />
    </>
  );
};

export default Charting;
