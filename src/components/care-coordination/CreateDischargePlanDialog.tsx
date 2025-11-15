import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface CreateDischargePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateDischargePlanDialog({ open, onOpenChange, onSuccess }: CreateDischargePlanDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    planned_discharge_date: '',
    discharge_disposition: 'home',
    discharge_location: '',
    dietary_instructions: '',
    activity_restrictions: '',
    warning_signs: '',
    equipment_needs: '',
    patient_education_completed: false,
    transportation_arranged: false,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('id, name')
        .order('name');
      return data || [];
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('discharge_plans').insert({
        ...formData,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success('Discharge plan created successfully');
      onSuccess();
      onOpenChange(false);
      setFormData({
        patient_id: '',
        planned_discharge_date: '',
        discharge_disposition: 'home',
        discharge_location: '',
        dietary_instructions: '',
        activity_restrictions: '',
        warning_signs: '',
        equipment_needs: '',
        patient_education_completed: false,
        transportation_arranged: false,
      });
    } catch (error) {
      console.error('Error creating discharge plan:', error);
      toast.error('Failed to create discharge plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Discharge Plan</DialogTitle>
          <DialogDescription>
            Plan patient discharge with comprehensive instructions and arrangements
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="planned_discharge_date">Planned Discharge Date</Label>
              <Input
                id="planned_discharge_date"
                type="date"
                value={formData.planned_discharge_date}
                onChange={(e) => setFormData({ ...formData, planned_discharge_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discharge_disposition">Discharge Disposition</Label>
              <Select
                value={formData.discharge_disposition}
                onValueChange={(value) => setFormData({ ...formData, discharge_disposition: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="skilled_nursing">Skilled Nursing Facility</SelectItem>
                  <SelectItem value="rehab">Rehabilitation Facility</SelectItem>
                  <SelectItem value="assisted_living">Assisted Living</SelectItem>
                  <SelectItem value="home_health">Home with Home Health</SelectItem>
                  <SelectItem value="hospice">Hospice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discharge_location">Discharge Location</Label>
              <Input
                id="discharge_location"
                value={formData.discharge_location}
                onChange={(e) => setFormData({ ...formData, discharge_location: e.target.value })}
                placeholder="Address or facility name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dietary_instructions">Dietary Instructions</Label>
            <Textarea
              id="dietary_instructions"
              value={formData.dietary_instructions}
              onChange={(e) => setFormData({ ...formData, dietary_instructions: e.target.value })}
              placeholder="Special diet, restrictions, supplements..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity_restrictions">Activity Restrictions</Label>
            <Textarea
              id="activity_restrictions"
              value={formData.activity_restrictions}
              onChange={(e) => setFormData({ ...formData, activity_restrictions: e.target.value })}
              placeholder="Weight limits, mobility restrictions, precautions..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warning_signs">Warning Signs to Watch For</Label>
            <Textarea
              id="warning_signs"
              value={formData.warning_signs}
              onChange={(e) => setFormData({ ...formData, warning_signs: e.target.value })}
              placeholder="Symptoms requiring immediate medical attention..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_needs">Equipment Needs</Label>
            <Textarea
              id="equipment_needs"
              value={formData.equipment_needs}
              onChange={(e) => setFormData({ ...formData, equipment_needs: e.target.value })}
              placeholder="Walker, wheelchair, oxygen, etc..."
              rows={2}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.patient_education_completed}
                onChange={(e) => setFormData({ ...formData, patient_education_completed: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm">Patient education completed</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.transportation_arranged}
                onChange={(e) => setFormData({ ...formData, transportation_arranged: e.target.checked })}
                className="rounded border-input"
              />
              <span className="text-sm">Transportation arranged</span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}