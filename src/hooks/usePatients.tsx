
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

const patientsQueryKey = "patients";

// Fetch all patients
const fetchPatients = async () => {
  try {
    return await getPatientsApi();
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Error loading patients: " + ((error as any)?.message || "Unknown error"));
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

export const usePatients = () => {
  return useQuery({
    queryKey: [patientsQueryKey],
    queryFn: fetchPatients,
    retry: 1,
    retryDelay: 1000,
  });
};

// Fetch a single patient by ID
const fetchPatient = async (id: string) => {
  try {
    return await getPatientApi(id);
  } catch (error) {
    console.error(`Error fetching patient with ID ${id}:`, error);
    toast.error(`Error fetching patient: ${(error as any)?.message || 'Unknown error'}`);
    throw error;
  }
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: [patientsQueryKey, id],
    queryFn: () => fetchPatient(id),
    enabled: !!id, // Only run the query if the patient ID is available
    retry: 1,
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
    },
    onError: (error) => {
      toast.error(`Error creating patient: ${(error as any)?.message || 'Unknown error'}`);
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
    },
    onError: (error) => {
      toast.error(`Error updating patient: ${(error as any)?.message || 'Unknown error'}`);
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
    },
    onError: (error) => {
      toast.error(`Error deleting patient: ${(error as any)?.message || 'Unknown error'}`);
    }
  });
};

const updatePatient = async (id: string, data: Partial<Patient>) => {
  try {
    return await updatePatientApi(id, data);
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};
