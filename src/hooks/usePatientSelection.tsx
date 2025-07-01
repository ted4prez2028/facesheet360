
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Patient } from "@/types";
import { toast } from "sonner";

/**
 * Hook to manage patient selection and data fetching
 */
export const usePatientSelection = (userId?: string | null) => {
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  
  // Fetch patients data with mock implementation since patients table doesn't exist
  const { data: patients, isLoading } = useQuery({
    queryKey: ['charting-patients'],
    queryFn: async () => {
      try {
        console.log("Fetching patients for charting with user ID:", userId);
        
        // Mock patients data since database table doesn't exist
        const mockPatients = [
          {
            id: '1',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '1980-01-15',
            gender: 'Male',
            facial_data: null
          },
          {
            id: '2',
            first_name: 'Jane',
            last_name: 'Smith',
            date_of_birth: '1975-03-22',
            gender: 'Female',
            facial_data: null
          },
          {
            id: '3',
            first_name: 'Robert',
            last_name: 'Johnson',
            date_of_birth: '1990-07-08',
            gender: 'Male',
            facial_data: null
          }
        ];
        
        console.log(`Found ${mockPatients.length} patients for charting`);
        
        return mockPatients.map(patient => ({
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
