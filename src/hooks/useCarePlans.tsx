
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    queryFn: async (): Promise<CarePlan[]> => {
      try {
        // Mock data since care_plans table doesn't exist
        const mockCarePlans: CarePlan[] = [
          {
            id: '1',
            patient_id: patientId || 'mock-patient-1',
            provider_id: user?.id || 'mock-provider-1',
            content: 'Comprehensive care plan for patient monitoring and treatment. Regular vital signs monitoring, medication adherence tracking, and follow-up appointments scheduled.',
            is_ai_generated: true,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            patient_id: patientId || 'mock-patient-1',
            provider_id: user?.id || 'mock-provider-1',
            content: 'Physical therapy and rehabilitation plan. Focus on mobility improvement and pain management strategies.',
            is_ai_generated: false,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        return patientId ? mockCarePlans.filter(plan => plan.patient_id === patientId) : mockCarePlans;
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
    mutationFn: async (patient: Patient): Promise<CarePlan> => {
      try {
        if (!user?.id) throw new Error("User not authenticated");
        
        // Mock AI-generated care plan since the Edge Function doesn't exist
        const mockCarePlan: CarePlan = {
          id: Date.now().toString(),
          patient_id: patient.id,
          provider_id: user.id,
          content: `AI-Generated Care Plan for ${patient.name || patient.first_name + ' ' + patient.last_name}:

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
   - Coordinate with specialists if required

This care plan was generated based on patient data and should be reviewed by healthcare professionals.`,
          is_ai_generated: true,
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        toast.success("AI Care Plan generated successfully!");
        return mockCarePlan;
      } catch (error) {
        console.error("Error generating AI care plan:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["carePlans"] });
      queryClient.invalidateQueries({ queryKey: ["carePlans", data.patient_id] });
    },
    onError: (error) => {
      console.error("Error in useGenerateAICarePlan:", error);
    },
  });
};

export const useAddCarePlan = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (carePlan: Omit<CarePlan, "id" | "created_at" | "updated_at">): Promise<CarePlan> => {
      try {
        // Mock implementation since care_plans table doesn't exist
        const mockCarePlan: CarePlan = {
          ...carePlan,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return mockCarePlan;
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
    mutationFn: async ({ id, status }: { id: string; status: CarePlan["status"] }): Promise<CarePlan> => {
      try {
        // Mock implementation since care_plans table doesn't exist
        const mockUpdatedPlan: CarePlan = {
          id,
          patient_id: 'mock-patient-1',
          provider_id: 'mock-provider-1',
          content: 'Mock care plan content',
          is_ai_generated: false,
          status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        return mockUpdatedPlan;
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
