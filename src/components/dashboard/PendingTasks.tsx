
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle } from "lucide-react";

interface Task {
  id: number;
  task: string;
  priority: string;
  due: string;
}

interface PendingTasksProps {
  tasks: Task[];
}

const PendingTasks = ({ tasks }: PendingTasksProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{task.task}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Badge variant={
                    task.priority === "High" 
                      ? "destructive" 
                      : task.priority === "Medium" 
                        ? "outline" 
                        : "secondary"
                  }>
                    {task.priority}
                  </Badge>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block"></span>
                  <span>Due: {task.due}</span>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>Complete</span>
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingTasks;
