
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

// Enhanced session check with detailed error handling
const verifySession = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("Session verification error:", sessionError);
    throw new Error("Authentication error. Please try logging in again.");
  }
  
  if (!sessionData.session) {
    throw new Error("Authentication required. Please log in to view patients.");
  }
  
  // Session exists and is valid
  return sessionData.session;
};

// Fetch all patients
const fetchPatients = async () => {
  try {
    // First check if we have a valid session
    await verifySession();
    
    // If we have a valid session, fetch patients
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
    await verifySession();
    
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
    mutationFn: async (patientData: Partial<Patient>) => {
      // Verify session before attempting to create
      await verifySession();
      return createPatientApi(patientData);
    },
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
    mutationFn: async (params: { id: string; data: Partial<Patient> }) => {
      // Verify session before attempting to update
      await verifySession();
      return updatePatientApi(params.id, params.data);
    },
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
    mutationFn: async (id: string) => {
      // Verify session before attempting to delete
      await verifySession();
      return deletePatientApi(id);
    },
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
