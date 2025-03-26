
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";

/**
 * Hook to manage patient selection and data fetching
 */
export const usePatientSelection = (userId?: string | null) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  
  // Fetch patients data
  const { data: patients, isLoading } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          facial_data
        `)
        .order('last_name', { ascending: true });
        
      if (error) throw error;
      
      return data.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        age: calculateAge(patient.date_of_birth),
        status: "Active",
        lastVisit: new Date().toISOString().split('T')[0],
        imgUrl: null
      }));
    },
    enabled: !!userId
  });
  
  // Helper function to calculate age from date of birth
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

  // Get the selected patient's data
  const selectedPatientData = patients?.find(p => p.id === selectedPatient);
  
  return {
    selectedPatient,
    setSelectedPatient,
    patients,
    isLoading,
    selectedPatientData
  };
};
