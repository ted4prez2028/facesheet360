import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface HealthGoal {
  id: string;
  patient_id: string;
  goal_type: 'appointment_attendance' | 'medication_adherence' | 'vital_signs_tracking' | 'therapy_attendance' | 'custom';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  reward_amount: number;
  status: 'active' | 'completed' | 'expired';
  start_date: string;
  end_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useHealthGoals = (patientId?: string) => {
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['health-goals', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as HealthGoal[];
    },
    enabled: !!patientId,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: Omit<HealthGoal, 'id' | 'created_at' | 'updated_at' | 'completed_at'>) => {
      const { data, error } = await supabase
        .from('health_goals')
        .insert([goal])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-goals'] });
      toast.success('Health goal created successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create goal: ${error.message}`);
    },
  });

  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, increment }: { goalId: string; increment: number }) => {
      // Get current goal
      const { data: goal, error: fetchError } = await supabase
        .from('health_goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (fetchError) throw fetchError;

      const newValue = goal.current_value + increment;
      const isCompleted = newValue >= goal.target_value;

      const { data, error } = await supabase
        .from('health_goals')
        .update({
          current_value: newValue,
          status: isCompleted ? 'completed' : 'active',
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['health-goals'] });
      if (data.status === 'completed') {
        toast.success(`🎉 Goal completed! You earned ${data.reward_amount} CareCoins!`);
      } else {
        toast.success('Progress updated!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Failed to update progress: ${error.message}`);
    },
  });

  return {
    goals,
    isLoading,
    createGoal,
    updateGoalProgress,
  };
};
