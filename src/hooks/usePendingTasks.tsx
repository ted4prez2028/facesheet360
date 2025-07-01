
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface PendingTask {
  id: string;
  task: string;
  priority: string;
  due: string;
}

/**
 * Fetches pending tasks for the logged-in provider
 * Using mock data since the required database tables don't exist
 */
export const usePendingTasks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-tasks', user?.id],
    queryFn: async (): Promise<PendingTask[]> => {
      if (!user?.id) return [];
      
      try {
        console.log("Fetching pending tasks for user:", user.id);
        
        // Mock pending tasks since the database tables don't exist
        const mockTasks: PendingTask[] = [
          {
            id: '1',
            task: 'Complete progress note for John Doe',
            priority: 'High',
            due: 'Today'
          },
          {
            id: '2',
            task: 'Review lab results for Jane Smith',
            priority: 'High',
            due: 'Today'
          },
          {
            id: '3',
            task: 'Update care plan for Robert Johnson',
            priority: 'Medium',
            due: 'Tomorrow'
          },
          {
            id: '4',
            task: 'Follow up with Mary Wilson',
            priority: 'Medium',
            due: 'Tomorrow'
          },
          {
            id: '5',
            task: 'Process prescription renewal for David Brown',
            priority: 'Low',
            due: 'Next Week'
          }
        ];
        
        console.log(`Generated ${mockTasks.length} mock pending tasks`);
        
        return mockTasks;
      } catch (error) {
        console.error("Error fetching pending tasks:", error);
        toast.error("Failed to load pending tasks");
        return [];
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
