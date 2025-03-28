
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle } from "lucide-react";
import { usePendingTasks, PendingTask } from "@/hooks/usePendingTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PendingTasksProps {
  tasks?: PendingTask[];
  isLoading?: boolean;
}

const PendingTasks = ({ tasks: propTasks, isLoading: propIsLoading }: PendingTasksProps) => {
  const { data: fetchedTasks, isLoading, refetch } = usePendingTasks();
  
  // Use provided tasks if available, otherwise use fetched data
  const tasks = propTasks || fetchedTasks || [];
  const loading = propIsLoading !== undefined ? propIsLoading : isLoading;
  
  const handleCompleteTask = (id: string, task: string) => {
    // For now, we'll just show a toast and refetch
    toast.success(`Task marked as complete: ${task}`);
    refetch();
  };
  
  const getBadgeVariant = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high':
        return "destructive";
      case 'medium':
        return "outline";
      case 'low':
        return "secondary";
      default:
        return "outline";
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{task.task}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant={getBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                    <span>Due: {task.due}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-1"
                  onClick={() => handleCompleteTask(task.id, task.task)}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No pending tasks found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingTasks;
