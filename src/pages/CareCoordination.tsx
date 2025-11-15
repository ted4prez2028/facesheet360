import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Users, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { CareTeamsManager } from '@/components/care-coordination/CareTeamsManager';

export default function CareCoordination() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch care tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['care-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('care_tasks')
        .select('*')
        .or(`assigned_to.eq.${user?.id},assigned_by.eq.${user?.id}`)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch discharge plans
  const { data: dischargePlans = [] } = useQuery({
    queryKey: ['discharge-plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discharge_plans')
        .select('*, patients(*)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from('care_tasks')
        .update({ 
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-tasks'] });
      toast.success('Task updated');
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Care Coordination Hub</h1>
        <p className="text-muted-foreground">Manage care teams, tasks, and discharge planning</p>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="discharge">Discharge Planning</TabsTrigger>
          <TabsTrigger value="teams">Care Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Care Tasks</CardTitle>
                  <CardDescription>Tasks assigned to you or by you</CardDescription>
                </div>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4" />
                  <p>No tasks assigned</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-semibold ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-lg">{task.task_title}</h3>
                          {task.task_description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.task_description}
                            </p>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3" />
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy h:mm a')}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'in_progress' })}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: 'completed' })}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discharge" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discharge Plans</CardTitle>
                  <CardDescription>Active and completed discharge plans</CardDescription>
                </div>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  New Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dischargePlans.map((plan: any) => (
                <Card key={plan.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={plan.plan_status === 'completed' ? 'default' : 'secondary'}>
                            {plan.plan_status}
                          </Badge>
                          {plan.discharge_date && (
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(plan.discharge_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium">
                          {plan.patients?.first_name} {plan.patients?.last_name}
                        </h3>
                        {plan.discharge_destination && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Destination: {plan.discharge_destination}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center gap-1 text-xs">
                            {plan.medications_reconciled ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                            Medications Reconciled
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {plan.follow_up_scheduled ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                            Follow-up Scheduled
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {plan.transportation_arranged ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                            Transportation Arranged
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {plan.patient_education_completed ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-yellow-500" />}
                            Patient Education
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams">
          <CareTeamsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}