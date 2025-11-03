import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save, Target, Activity, TrendingUp } from 'lucide-react';
import { useCreateCarePlan } from '@/hooks/useCarePlansMutation';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Goal {
  id: string;
  description: string;
  targetDate: string;
  status: 'not-started' | 'in-progress' | 'achieved' | 'discontinued';
  progress: number;
}

interface Intervention {
  id: string;
  description: string;
  frequency: string;
  assignedTo: string;
}

interface EnhancedCarePlanFormProps {
  patientId: string;
  onSuccess?: () => void;
}

export const EnhancedCarePlanForm = ({ patientId, onSuccess }: EnhancedCarePlanFormProps) => {
  const { user } = useAuth();
  const createCarePlan = useCreateCarePlan();
  const { logEvent } = useAuditLog();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);

  const addGoal = () => {
    setGoals([...goals, {
      id: crypto.randomUUID(),
      description: '',
      targetDate: '',
      status: 'not-started',
      progress: 0
    }]);
  };

  const removeGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const updateGoal = (id: string, field: keyof Goal, value: any) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const addIntervention = () => {
    setInterventions([...interventions, {
      id: crypto.randomUUID(),
      description: '',
      frequency: '',
      assignedTo: ''
    }]);
  };

  const removeIntervention = (id: string) => {
    setInterventions(interventions.filter(i => i.id !== id));
  };

  const updateIntervention = (id: string, field: keyof Intervention, value: string) => {
    setInterventions(interventions.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!title.trim() || !startDate) {
      toast.error('Please fill in required fields');
      return;
    }

    if (goals.length === 0) {
      toast.error('Please add at least one goal');
      return;
    }

    await createCarePlan.mutateAsync({
      patient_id: patientId,
      title,
      description,
      start_date: startDate,
      target_date: targetDate || undefined,
      goals: goals.map(g => ({ ...g, id: undefined })),
      interventions: interventions.map(i => ({ ...i, id: undefined })),
      status: 'active',
      created_by: user.id
    });

    // Log audit event
    await logEvent('chart_access', patientId, undefined, {
      action: 'care_plan_created',
      plan_title: title,
      goals_count: goals.length,
      interventions_count: interventions.length
    });

    // Reset form
    setTitle('');
    setDescription('');
    setStartDate('');
    setTargetDate('');
    setGoals([]);
    setInterventions([]);
    
    toast.success('Care plan created successfully');
    onSuccess?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Care Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Post-Surgical Recovery Plan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Overview of care plan objectives"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Completion Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>

        {/* Goals Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Goals</h3>
            </div>
            <Button onClick={addGoal} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>

          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label>Goal Description</Label>
                      <Textarea
                        placeholder="e.g., Patient will ambulate 50 feet with walker"
                        value={goal.description}
                        onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label>Target Date</Label>
                        <Input
                          type="date"
                          value={goal.targetDate}
                          onChange={(e) => updateGoal(goal.id, 'targetDate', e.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Status</Label>
                        <Select 
                          value={goal.status} 
                          onValueChange={(value) => updateGoal(goal.id, 'status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Not Started</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="achieved">Achieved</SelectItem>
                            <SelectItem value="discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Progress (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => updateGoal(goal.id, 'progress', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => removeGoal(goal.id)}
                    variant="ghost"
                    size="icon"
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {goals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No goals added yet. Click "Add Goal" to get started.</p>
            </div>
          )}
        </div>

        {/* Interventions Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Interventions</h3>
            </div>
            <Button onClick={addIntervention} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Intervention
            </Button>
          </div>

          {interventions.map((intervention) => (
            <Card key={intervention.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <Label>Intervention Description</Label>
                    <Input
                      placeholder="e.g., Physical therapy for gait training"
                      value={intervention.description}
                      onChange={(e) => updateIntervention(intervention.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Frequency</Label>
                    <Input
                      placeholder="e.g., 2x daily"
                      value={intervention.frequency}
                      onChange={(e) => updateIntervention(intervention.id, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 md:col-span-3">
                    <Label>Assigned To</Label>
                    <Input
                      placeholder="e.g., Physical Therapist, RN"
                      value={intervention.assignedTo}
                      onChange={(e) => updateIntervention(intervention.id, 'assignedTo', e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => removeIntervention(intervention.id)}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}

          {interventions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No interventions added yet. Click "Add Intervention" to get started.</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} disabled={createCarePlan.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Care Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
