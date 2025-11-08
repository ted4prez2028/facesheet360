import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHealthGoals } from '@/hooks/useHealthGoals';
import { useState } from 'react';

interface CreateHealthGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export const CreateHealthGoalDialog = ({ open, onOpenChange, patientId }: CreateHealthGoalDialogProps) => {
  const { createGoal } = useHealthGoals(patientId);
  const [formData, setFormData] = useState({
    goal_type: 'appointment_attendance',
    title: '',
    description: '',
    target_value: 1,
    reward_amount: 10,
    end_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createGoal.mutateAsync({
      patient_id: patientId,
      goal_type: formData.goal_type as any,
      title: formData.title,
      description: formData.description,
      target_value: formData.target_value,
      current_value: 0,
      reward_amount: formData.reward_amount,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: formData.end_date || undefined,
    });

    onOpenChange(false);
    setFormData({
      goal_type: 'appointment_attendance',
      title: '',
      description: '',
      target_value: 1,
      reward_amount: 10,
      end_date: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Health Goal</DialogTitle>
          <DialogDescription>
            Set a health goal for the patient to earn CareCoins upon completion
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal_type">Goal Type</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
            >
              <SelectTrigger id="goal_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appointment_attendance">Appointment Attendance</SelectItem>
                <SelectItem value="medication_adherence">Medication Adherence</SelectItem>
                <SelectItem value="vital_signs_tracking">Vital Signs Tracking</SelectItem>
                <SelectItem value="therapy_attendance">Therapy Attendance</SelectItem>
                <SelectItem value="custom">Custom Goal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              placeholder="e.g., Attend 5 appointments"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the goal and what the patient needs to do"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value</Label>
              <Input
                id="target_value"
                type="number"
                min="1"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward_amount">Reward (CareCoins)</Label>
              <Input
                id="reward_amount"
                type="number"
                min="1"
                value={formData.reward_amount}
                onChange={(e) => setFormData({ ...formData, reward_amount: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGoal.isPending}>
              {createGoal.isPending ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
