import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPatient as createPatientApi,
  getPatient as getPatientApi,
  getPatients as getPatientsApi,
  updatePatient as updatePatientApi,
  deletePatient as deletePatientApi,
} from "@/lib/supabaseApi";
import { Patient } from "@/types";

const patientsQueryKey = "patients";

// Fetch all patients
const fetchPatients = async () => {
  return await getPatientsApi();
};

export const usePatients = () => {
  return useQuery({
    queryKey: [patientsQueryKey],
    queryFn: fetchPatients,
  });
};

// Fetch a single patient by ID
const fetchPatient = async (id: string) => {
  return await getPatientApi(id);
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: [patientsQueryKey, id],
    queryFn: () => fetchPatient(id),
    enabled: !!id, // Only run the query if the patient ID is available
  });
};

// Create a new patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries([patientsQueryKey]);
    },
  });
};

// Update an existing patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; data: Partial<Patient> }) =>
      updatePatientApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries([patientsQueryKey]);
    },
  });
};

// Delete a patient
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatientApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries([patientsQueryKey]);
    },
  });
};

const updatePatient = async (id: string, data: Partial<Patient>) => {
  // Make a copy of the data to remove non-existent properties
  const updateData = { ...data };
  
  // Remove properties that don't exist in the Patient type
  // @ts-ignore - We're checking for properties that might not exist
  if ('condition' in updateData) delete updateData.condition;
  // @ts-ignore - We're checking for properties that might not exist
  if ('status' in updateData) delete updateData.status;
  
  try {
    return await updatePatientApi(id, updateData);
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};
