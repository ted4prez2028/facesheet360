
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface Prescription {
  id: string;
  patient_id: string;
  provider_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string;
  instructions?: string;
  status: "prescribed" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export const usePrescriptions = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("prescriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (patientId) {
          query = query.eq("patient_id", patientId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data as Prescription[];
      } catch (error) {
        console.error("Error fetching prescriptions:", error);
        toast.error("Failed to load prescriptions");
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

export const useAddPrescription = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescription: Omit<Prescription, "id" | "created_at" | "updated_at">) => {
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .insert(prescription)
          .select()
          .single();

        if (error) throw error;
        return data as Prescription;
      } catch (error) {
        console.error("Error adding prescription:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions", variables.patient_id] });
      toast.success("Prescription added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add prescription: ${(error as Error).message}`);
    },
  });
};

export const useUpdatePrescriptionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, administeredBy }: 
      { id: string; status: Prescription["status"]; administeredBy?: string }) => {
      try {
        const updateData: any = { status };
        
        if (status === "active" && administeredBy) {
          updateData.administered_by = administeredBy;
          updateData.administered_at = new Date().toISOString();
        }
        
        const { data, error } = await supabase
          .from("prescriptions")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data as Prescription;
      } catch (error) {
        console.error("Error updating prescription status:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions", data.patient_id] });
      toast.success(`Prescription status updated to ${data.status}`);
    },
    onError: (error) => {
      toast.error(`Failed to update prescription: ${(error as Error).message}`);
    },
  });
};
