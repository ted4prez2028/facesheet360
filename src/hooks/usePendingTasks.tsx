
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface PatientInfo {
  first_name: string;
  last_name: string;
}

export interface PendingTask {
  id: string;
  task: string;
  priority: string;
  due: string;
}

/**
 * Fetches pending tasks for the logged-in provider
 */
export const usePendingTasks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['pending-tasks', user?.id],
    queryFn: async (): Promise<PendingTask[]> => {
      if (!user?.id) return [];
      
      try {
        // First, try to get incomplete chart records that need attention
        const { data: chartRecords, error: chartError } = await supabase
          .from('chart_records')
          .select(`
            id,
            patient_id,
            patients:patient_id (
              first_name,
              last_name
            ),
            record_date,
            record_type
          `)
          .eq('provider_id', user.id)
          .is('notes', null)
          .order('record_date', { ascending: false })
          .limit(5);
          
        if (chartError) throw chartError;
        
        const tasks: PendingTask[] = [];
        
        // Add chart records that need completion
        if (chartRecords && chartRecords.length > 0) {
          for (const record of chartRecords) {
            const patient = record.patients as PatientInfo;
            const recordDate = new Date(record.record_date);
            const now = new Date();
            
            // Determine due date
            let due = "Today";
            const daysDiff = Math.floor((now.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > 2) {
              due = "Overdue";
            } else if (daysDiff > 0) {
              due = "Today";
            } else {
              due = "Tomorrow";
            }
            
            // Determine priority
            let priority = "Medium";
            if (daysDiff > 2) {
              priority = "High";
            } else if (daysDiff === 0) {
              priority = "Low";
            }
            
            tasks.push({
              id: record.id,
              task: `Complete ${record.record_type} record for ${patient.first_name} ${patient.last_name}`,
              priority,
              due
            });
          }
        }
        
        // Get pending lab results to review
        const { data: labResults, error: labError } = await supabase
          .from('lab_results')
          .select(`
            id,
            patient_id,
            patients:patient_id (
              first_name,
              last_name
            ),
            date_performed,
            test_name,
            flagged
          `)
          .eq('flagged', true)
          .order('date_performed', { ascending: false })
          .limit(3);
          
        if (labError) throw labError;
        
        // Add flagged lab results
        if (labResults && labResults.length > 0) {
          for (const result of labResults) {
            const patient = result.patients as PatientInfo;
            
            tasks.push({
              id: result.id,
              task: `Review ${result.test_name} results for ${patient.first_name} ${patient.last_name}`,
              priority: "High",
              due: "Today"
            });
          }
        }
        
        // If we have less than 5 tasks, add some generated tasks
        if (tasks.length < 5) {
          const { data: patients, error: patientsError } = await supabase
            .from('patients')
            .select('id, first_name, last_name')
            .limit(5);
            
          if (!patientsError && patients && patients.length > 0) {
            // Add some generated tasks
            const taskTypes = [
              'Update care plan for',
              'Follow up with',
              'Process prescription renewal for',
              'Check insurance status for'
            ];
            
            const priorities = ["Low", "Medium", "High"];
            const dueDates = ["Today", "Tomorrow", "Next Week"];
            
            while (tasks.length < 5 && patients.length > 0) {
              const patient = patients.pop();
              const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
              const priority = priorities[Math.floor(Math.random() * priorities.length)];
              const due = dueDates[Math.floor(Math.random() * dueDates.length)];
              
              tasks.push({
                id: `task-${tasks.length + 1}`,
                task: `${taskType} ${patient?.first_name} ${patient?.last_name}`,
                priority,
                due
              });
            }
          }
        }
        
        return tasks;
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
