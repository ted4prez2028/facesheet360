
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Prescription } from "@/types";

export const usePrescriptions = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: async (): Promise<Prescription[]> => {
      try {
        const query = supabase
          .from("prescriptions")
          .select(`
            *,
            patients!inner(
              first_name,
              last_name,
              medical_record_number
            )
          `)
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

export const useAdministerPrescription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prescriptionId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      try {
        const { data, error } = await supabase
          .from("prescriptions")
          .update({
            status: "administered",
            administered_by: user.id,
            administered_at: new Date().toISOString()
          })
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

export const useUpdatePrescriptionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, administeredBy }: { id: string; status: Prescription["status"]; administeredBy?: string }) => {
      try {
        const updateData: Partial<Prescription> = { status };
        
        if (administeredBy) {
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
      
      const statusMessages = {
        prescribed: "Prescription status updated",
        administered: "Medication marked as administered",
        cancelled: "Prescription cancelled"
      };
      
      toast.success(statusMessages[data.status]);
    },
    onError: (error) => {
      toast.error(`Failed to update prescription: ${(error as Error).message}`);
    },
  });
};
