import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useHealthGoals } from '@/hooks/useHealthGoals';
import { useAuth } from '@/hooks/useAuth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { Target, Trophy, Calendar, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { CreateHealthGoalDialog } from './CreateHealthGoalDialog';

export const HealthGoalsDashboard = ({ patientId }: { patientId: string }) => {
  const { goals, isLoading } = useHealthGoals(patientId);
  const { hasAnyRole } = useRolePermissions();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const isHealthcareStaff = hasAnyRole(['admin', 'doctor', 'nurse', 'therapist']);

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const completedGoals = goals?.filter(g => g.status === 'completed') || [];

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'appointment_attendance': return <Calendar className="h-4 w-4" />;
      case 'medication_adherence': return <Clock className="h-4 w-4" />;
      case 'vital_signs_tracking': return <TrendingUp className="h-4 w-4" />;
      case 'therapy_attendance': return <Target className="h-4 w-4" />;
      default: return <Trophy className="h-4 w-4" />;
    }
  };

  const getGoalTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      appointment_attendance: 'Appointment Attendance',
      medication_adherence: 'Medication Adherence',
      vital_signs_tracking: 'Vital Signs Tracking',
      therapy_attendance: 'Therapy Attendance',
      custom: 'Custom Goal',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading health goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Goals & Rewards</h2>
          <p className="text-muted-foreground">
            Complete goals to earn CareCoins and improve your health
          </p>
        </div>
        {isHealthcareStaff && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Target className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeGoals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed Goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rewards Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {completedGoals.reduce((sum, g) => sum + Number(g.reward_amount), 0)} CC
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Active Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = (goal.current_value / goal.target_value) * 100;
              return (
                <div key={goal.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        {getGoalIcon(goal.goal_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <Badge variant="outline" className="mt-1">
                          {getGoalTypeLabel(goal.goal_type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {goal.reward_amount} CC
                      </div>
                      <p className="text-xs text-muted-foreground">reward</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {goal.current_value} / {goal.target_value}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {goal.end_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Due: {format(new Date(goal.end_date), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completed Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {format(new Date(goal.completed_at!), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600">+{goal.reward_amount} CC</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {goals?.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Health Goals Yet</h3>
            <p className="text-muted-foreground">
              Healthcare staff can create health goals to help you earn CareCoins
            </p>
          </CardContent>
        </Card>
      )}

      <CreateHealthGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        patientId={patientId}
      />
    </div>
  );
};
