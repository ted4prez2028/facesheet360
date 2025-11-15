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
  // Database fields
  plan_type?: string;
  goals?: any;
  interventions?: any;
  created_by?: string;
  start_date?: string;
  end_date?: string;
}

export const useCarePlans = (patientId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["carePlans", patientId],
    queryFn: async (): Promise<CarePlan[]> => {
      const { data, error } = await supabase
        .from('care_plans')
        .select('*')
        .eq('patient_id', patientId || '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(plan => ({
        id: plan.id,
        patient_id: plan.patient_id,
        provider_id: plan.created_by,
        content: typeof plan.goals === 'string' ? plan.goals : JSON.stringify(plan.goals),
        is_ai_generated: false,
        status: plan.status as any,
        created_at: plan.created_at || new Date().toISOString(),
        updated_at: plan.updated_at || new Date().toISOString(),
        plan_type: plan.plan_type,
        goals: plan.goals,
        interventions: plan.interventions,
        created_by: plan.created_by,
        start_date: plan.start_date,
        end_date: plan.end_date
      }));
    },
    enabled: !!user?.id && !!patientId,
  });
};

export const useGenerateAICarePlan = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (patient: Patient): Promise<CarePlan> => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const aiGeneratedContent = `AI-Generated Care Plan for ${patient.name || patient.first_name + ' ' + patient.last_name}:

1. Assessment and Monitoring:
   - Regular vital signs monitoring
   - Pain assessment and management
   - Medication adherence tracking

2. Treatment Goals:
   - Improve overall health outcomes
   - Maintain quality of life
   - Prevent complications

3. Follow-up Care:
   - Schedule regular check-ups
   - Monitor progress and adjust treatment as needed
   - Coordinate with specialists if required`;

      const { data, error } = await supabase
        .from('care_plans')
        .insert({
          patient_id: patient.id,
          plan_type: 'comprehensive',
          created_by: user.id,
          start_date: new Date().toISOString().split('T')[0],
          goals: [aiGeneratedContent],
          interventions: [],
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        patient_id: data.patient_id,
        provider_id: data.created_by,
        content: aiGeneratedContent,
        is_ai_generated: true,
        status: "draft",
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      queryClient.invalidateQueries({ queryKey: ["carePlans", data.patient_id] });
      toast.success("AI Care Plan generated successfully!");
    },
    onError: (error) => {
      console.error("Error generating AI care plan:", error);
      toast.error("Failed to generate AI care plan");
    },
  });
};

export const useAddCarePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (carePlan: Omit<CarePlan, "id" | "created_at" | "updated_at">): Promise<CarePlan> => {
      const { data, error } = await supabase
        .from('care_plans')
        .insert({
          patient_id: carePlan.patient_id,
          plan_type: 'standard',
          created_by: carePlan.provider_id,
          start_date: new Date().toISOString().split('T')[0],
          goals: [carePlan.content],
          interventions: [],
          status: carePlan.status
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...carePlan,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
    mutationFn: async ({ id, status }: { id: string; status: CarePlan["status"] }): Promise<CarePlan> => {
      const { data, error } = await supabase
        .from('care_plans')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        patient_id: data.patient_id,
        provider_id: data.created_by,
        content: typeof data.goals === 'string' ? data.goals : JSON.stringify(data.goals),
        is_ai_generated: false,
        status: data.status as any,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
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
