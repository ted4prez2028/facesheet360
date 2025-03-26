
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
  status: "prescribed" | "administered" | "cancelled";
  administered_by?: string;
  administered_at?: string;
  created_at: string;
  updated_at: string;
}

export const usePrescriptions = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async () => {
      try {
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const query = supabase
          .from("prescriptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (patientId) {
          query.eq("patient_id", patientId);
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
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const { data, error } = await supabase
          .from("prescriptions")
          .insert(prescription as any)
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

export const useAdministerPrescription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      try {
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const { data, error } = await supabase
          .from("prescriptions")
          .update({
            status: "administered",
            administered_by: user.id,
            administered_at: new Date().toISOString()
          } as any)
          .eq("id", prescriptionId)
          .select()
          .single();

        if (error) throw error;
        return data as Prescription;
      } catch (error) {
        console.error("Error administering prescription:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      queryClient.invalidateQueries({ queryKey: ["prescriptions", data.patient_id] });
      toast.success("Medication marked as administered");
    },
    onError: (error) => {
      toast.error(`Failed to administer medication: ${(error as Error).message}`);
    },
  });
};
