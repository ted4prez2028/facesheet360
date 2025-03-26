
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import PatientList from "@/components/charting/PatientList";
import PatientChart from "@/components/charting/PatientChart";
import AddPatientSheet from "@/components/charting/AddPatientSheet";

const Charting = () => {
  const { user } = useAuth();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  
  const { data: patients } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      const { data, error } = await fetch('/api/patients').then(res => res.json());
      if (error) throw error;
      return data;
    },
    enabled: false // Disable this query as it's handled in PatientList component
  });
  
  const selectedPatientData = patients?.find(p => p.id === selectedPatient);

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
