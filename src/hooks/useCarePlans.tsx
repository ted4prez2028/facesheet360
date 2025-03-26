
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Patient } from "@/types";

export interface CarePlan {
  id: string;
  patient_id: string;
  provider_id: string;
  content: string;
  is_ai_generated: boolean;
  status: "draft" | "active" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export const useCarePlans = (patientId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["carePlans", patientId],
    queryFn: async () => {
      try {
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const query = supabase
          .from("care_plans")
          .select("*")
          .order("created_at", { ascending: false });

        if (patientId) {
          query.eq("patient_id", patientId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data as CarePlan[];
      } catch (error) {
        console.error("Error fetching care plans:", error);
        toast.error("Failed to load care plans");
        return [];
      }
    },
    enabled: !!user?.id,
  });
};

export const useGenerateAICarePlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patient: Patient) => {
      try {
        if (!user?.id) throw new Error("User not authenticated");
        
        const { data: carePlan, error: apiError } = await supabase.functions.invoke("generate-care-plan", {
          body: { patientData: patient }
        });
        
        if (apiError) throw new Error(apiError.message);
        
        // Save the AI-generated care plan to the database
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const { data, error } = await supabase
          .from("care_plans")
          .insert({
            patient_id: patient.id,
            provider_id: user.id,
            content: carePlan.carePlan,
            is_ai_generated: true,
            status: "draft"
          } as any)
          .select()
          .single();

        if (error) throw error;
        return data as CarePlan;
      } catch (error) {
        console.error("Error generating AI care plan:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      queryClient.invalidateQueries({ queryKey: ["carePlans", data.patient_id] });
      toast.success("AI Care Plan generated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to generate AI care plan: ${(error as Error).message}`);
    },
  });
};

export const useAddCarePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (carePlan: Omit<CarePlan, "id" | "created_at" | "updated_at">) => {
      try {
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const { data, error } = await supabase
          .from("care_plans")
          .insert(carePlan as any)
          .select()
          .single();

        if (error) throw error;
        return data as CarePlan;
      } catch (error) {
        console.error("Error adding care plan:", error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      queryClient.invalidateQueries({ queryKey: ["carePlans", variables.patient_id] });
      toast.success("Care plan added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add care plan: ${(error as Error).message}`);
    },
  });
};

export const useUpdateCarePlanStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CarePlan["status"] }) => {
      try {
        // Use type casting to handle the table that's not in the TypeScript definitions yet
        const { data, error } = await supabase
          .from("care_plans")
          .update({ status } as any)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data as CarePlan;
      } catch (error) {
        console.error("Error updating care plan status:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      queryClient.invalidateQueries({ queryKey: ["carePlans", data.patient_id] });
      toast.success(`Care plan status updated to ${data.status}`);
    },
    onError: (error) => {
      toast.error(`Failed to update care plan: ${(error as Error).message}`);
    },
  });
};
