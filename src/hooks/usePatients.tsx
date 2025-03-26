
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPatient as createPatientApi,
  getPatientById as getPatientApi,
  getPatients as getPatientsApi,
  updatePatient as updatePatientApi,
  deletePatient as deletePatientApi,
} from "@/lib/supabaseApi";
import { Patient } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const patientsQueryKey = "patients";

// Fetch all patients
const fetchPatients = async () => {
  try {
    // First check if we have a valid session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to view patients.");
    }
    
    return await getPatientsApi();
  } catch (error: any) {
    console.error("Error fetching patients:", error);
    
    // Handle specific RLS policy error
    if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
      throw new Error("Database permission error. Please ensure you're logged in with the correct credentials.");
    }
    
    throw error; // Let the calling code handle the error display
  }
};

export const usePatients = () => {
  return useQuery({
    queryKey: [patientsQueryKey],
    queryFn: fetchPatients,
    retry: 2,
    retryDelay: 1000,
  });
};

// Fetch a single patient by ID
const fetchPatient = async (id: string) => {
  try {
    // First check if we have a valid session
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please log in to view patient details.");
    }
    
    return await getPatientApi(id);
  } catch (error: any) {
    console.error(`Error fetching patient with ID ${id}:`, error);
    
    // Handle specific RLS policy error
    if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
      throw new Error("Database permission error. Please ensure you're logged in with the correct credentials.");
    }
    
    throw error;
  }
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: [patientsQueryKey, id],
    queryFn: () => fetchPatient(id),
    enabled: !!id, // Only run the query if the patient ID is available
    retry: 2,
    retryDelay: 1000,
  });
};

// Create a new patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [patientsQueryKey] });
      toast.success("Patient created successfully");
    },
    onError: (error: any) => {
      // Handle specific RLS policy error
      if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
        toast.error("Database permission error. Please ensure you're logged in with the correct credentials.");
      } else {
        toast.error(`Error creating patient: ${error?.message || 'Unknown error'}`);
      }
    }
  });
};

// Update an existing patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: Partial<Patient> }) => 
      updatePatientApi(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [patientsQueryKey] });
      toast.success("Patient updated successfully");
    },
    onError: (error: any) => {
      // Handle specific RLS policy error
      if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
        toast.error("Database permission error. Please ensure you're logged in with the correct credentials.");
      } else {
        toast.error(`Error updating patient: ${error?.message || 'Unknown error'}`);
      }
    }
  });
};

// Delete a patient
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatientApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [patientsQueryKey] });
      toast.success("Patient deleted successfully");
    },
    onError: (error: any) => {
      // Handle specific RLS policy error
      if (error?.message?.includes('infinite recursion') || error?.code === '42P17') {
        toast.error("Database permission error. Please ensure you're logged in with the correct credentials.");
      } else {
        toast.error(`Error deleting patient: ${error?.message || 'Unknown error'}`);
      }
    }
  });
};
