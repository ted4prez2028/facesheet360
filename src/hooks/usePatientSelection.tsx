
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types";
import { toast } from "sonner";

/**
 * Hook to manage patient selection and data fetching
 */
export const usePatientSelection = (userId?: string | null) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  
  // Fetch patients data with improved error handling
  const { data: patients, isLoading } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      try {
        console.log("Fetching patients for charting with user ID:", userId);
        
        // Try using the RPC function first which bypasses RLS
        const { data: rpcData, error: rpcError } = await supabase
          .rpc('get_all_patients');
        
        if (!rpcError && rpcData) {
          console.log("Successfully fetched patients using RPC function");
          return rpcData.map(patient => ({
            id: patient.id,
            name: `${patient.first_name} ${patient.last_name}`,
            age: calculateAge(patient.date_of_birth),
            status: "Active",
            lastVisit: new Date().toISOString().split('T')[0],
            imgUrl: null
          }));
        }
        
        // If RPC fails, try direct query
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
          
        if (error) {
          console.error("Error fetching patients for charting:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.log("No patients found in database");
        } else {
          console.log(`Found ${data.length} patients for charting`);
        }
        
        return data.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          age: calculateAge(patient.date_of_birth),
          status: "Active",
          lastVisit: new Date().toISOString().split('T')[0],
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
    staleTime: 60000 // Cache for 1 minute
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
