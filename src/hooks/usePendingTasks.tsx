
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

export interface PendingTask {
  id: string;
  task: string;
  priority: string;
  due: string;
}

export const usePendingTasks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-tasks', user?.id],
    queryFn: async (): Promise<PendingTask[]> => {
      if (!user?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select(`
            *,
            patients:patient_id (
              first_name,
              last_name
            )
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((task: any) => {
          const patientName = task.patients 
            ? `${task.patients.first_name} ${task.patients.last_name}`
            : 'Unknown Patient';
          
          // Determine priority based on task description
          let priority = 'Medium';
          const taskLower = task.task_description.toLowerCase();
          if (taskLower.includes('urgent') || taskLower.includes('emergency') || taskLower.includes('critical')) {
            priority = 'High';
          } else if (taskLower.includes('routine') || taskLower.includes('follow up')) {
            priority = 'Low';
          }

          // Calculate due date
          const createdDate = new Date(task.created_at);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - createdDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let due = 'Today';
          if (diffDays === 1) {
            due = 'Tomorrow';
          } else if (diffDays > 1) {
            due = 'Next Week';
          }

          return {
            id: task.id,
            task: `${task.task_description} for ${patientName}`,
            priority,
            due
          };
        });
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
        toast.error("Failed to load pending tasks");
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });
};
