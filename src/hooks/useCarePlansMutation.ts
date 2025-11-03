import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CarePlanInput {
  patient_id: string;
  title: string;
  description?: string;
  start_date: string;
  target_date?: string;
  goals: any[];
  interventions: any[];
  status: string;
  created_by: string;
}

export const useCreateCarePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CarePlanInput) => {
      const { data, error } = await supabase
        .from('care_plans')
        .insert({
          patient_id: input.patient_id,
          title: input.title,
          description: input.description,
          start_date: input.start_date,
          target_date: input.target_date,
          goals: input.goals,
          interventions: input.interventions,
          status: input.status,
          created_by: input.created_by
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['carePlans', variables.patient_id] });
      toast.success('Care plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create care plan: ${error.message}`);
    }
  });
};

export const useDeleteCarePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('care_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carePlans'] });
      toast.success('Care plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete care plan: ${error.message}`);
    }
  });
};
