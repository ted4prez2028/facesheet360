
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import { Patient } from "@/types";
import { toast } from "sonner";

interface PatientForSelection {
  id: string;
  name: string;
  age: number;
  status: string;
  lastVisit: string;
  imgUrl: string | null;
}

export const usePatientSelection = (userId?: string | null) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  
  const { data: patients, isLoading } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async (): Promise<PatientForSelection[]> => {
      try {
        const { data, error } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((patient: Patient) => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          age: calculateAge(patient.date_of_birth),
          status: "Active",
          lastVisit: new Date(patient.updated_at).toISOString().split('T')[0],
          imgUrl: null
        }));
      } catch (error) {
        console.error("Failed to fetch patients for charting:", error);
        toast.error("Failed to load patients list");
        return [];
      }
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 60000
  });
  
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const selectedPatientData = patients?.find(p => p.id === selectedPatient);
  
  return {
    selectedPatient,
    setSelectedPatient,
    patients,
    isLoading,
    selectedPatientData
  };
};
