/**
 * Discharge Form Dialog - Collects required discharge data before generating PDF
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { DischargeFormData, ValidationError } from '@/types/discharge';

interface DischargeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DischargeFormData) => Promise<void>;
  patientName: string;
}

export const DischargeFormDialog = ({ open, onOpenChange, onSubmit, patientName }: DischargeFormDialogProps) => {
  const [formData, setFormData] = useState<DischargeFormData>({
    discharge_condition: 'stable',
    discharge_disposition: 'home',
    discharge_activity: '',
    discharge_diet: '',
    discharge_instructions: '',
    discharge_follow_up: '',
    selected_procedures: [],
    selected_consultations: [],
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    if (!formData.discharge_activity?.trim()) {
      newErrors.push({ field: 'discharge_activity', message: 'Activity instructions are required' });
    }
    if (!formData.discharge_diet?.trim()) {
      newErrors.push({ field: 'discharge_diet', message: 'Diet instructions are required' });
    }
    if (!formData.discharge_instructions?.trim()) {
      newErrors.push({ field: 'discharge_instructions', message: 'Discharge instructions are required' });
    }
    if (!formData.discharge_follow_up?.trim()) {
      newErrors.push({ field: 'discharge_follow_up', message: 'Follow-up care instructions are required' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
      // Reset form
      setFormData({
        discharge_condition: 'stable',
        discharge_disposition: 'home',
        discharge_activity: '',
        discharge_diet: '',
        discharge_instructions: '',
        discharge_follow_up: '',
        selected_procedures: [],
        selected_consultations: [],
      });
      setErrors([]);
    } catch (error) {
      console.error('Error submitting discharge form:', error);
      setErrors([{ field: 'general', message: 'Failed to generate discharge summary. Please try again.' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorForField = (field: string) => errors.find(e => e.field === field);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Discharge Patient: {patientName}</DialogTitle>
          <DialogDescription>
            Please fill out all required discharge information. This data will be used to generate the discharge summary PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {errors.find(e => e.field === 'general') && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.find(e => e.field === 'general')?.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="condition">Discharge Condition *</Label>
            <Select
              value={formData.discharge_condition}
              onValueChange={(value) => setFormData(prev => ({ ...prev, discharge_condition: value as any }))}
            >
              <SelectTrigger id="condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stable">Stable</SelectItem>
                <SelectItem value="improved">Improved</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disposition">Discharge Disposition *</Label>
            <Select
              value={formData.discharge_disposition}
              onValueChange={(value) => setFormData(prev => ({ ...prev, discharge_disposition: value as any }))}
            >
              <SelectTrigger id="disposition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home with Family</SelectItem>
                <SelectItem value="snf">Skilled Nursing Facility</SelectItem>
                <SelectItem value="rehab">Rehabilitation Facility</SelectItem>
                <SelectItem value="hospice">Hospice Care</SelectItem>
                <SelectItem value="ama">Against Medical Advice (AMA)</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity Instructions *</Label>
            <Textarea
              id="activity"
              placeholder="e.g., Ambulate with assistance, no lifting >10 lbs for 6 weeks..."
              value={formData.discharge_activity}
              onChange={(e) => setFormData(prev => ({ ...prev, discharge_activity: e.target.value }))}
              className={getErrorForField('discharge_activity') ? 'border-destructive' : ''}
              rows={3}
            />
            {getErrorForField('discharge_activity') && (
              <p className="text-sm text-destructive">{getErrorForField('discharge_activity')?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="diet">Diet Instructions *</Label>
            <Textarea
              id="diet"
              placeholder="e.g., Regular diet, no restrictions; 2g sodium restriction; diabetic diet..."
              value={formData.discharge_diet}
              onChange={(e) => setFormData(prev => ({ ...prev, discharge_diet: e.target.value }))}
              className={getErrorForField('discharge_diet') ? 'border-destructive' : ''}
              rows={2}
            />
            {getErrorForField('discharge_diet') && (
              <p className="text-sm text-destructive">{getErrorForField('discharge_diet')?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Discharge Instructions *</Label>
            <Textarea
              id="instructions"
              placeholder="Include wound care, medication instructions, activity restrictions, warning signs to watch for..."
              value={formData.discharge_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, discharge_instructions: e.target.value }))}
              className={getErrorForField('discharge_instructions') ? 'border-destructive' : ''}
              rows={5}
            />
            {getErrorForField('discharge_instructions') && (
              <p className="text-sm text-destructive">{getErrorForField('discharge_instructions')?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="followup">Follow-up Care *</Label>
            <Textarea
              id="followup"
              placeholder="e.g., Follow up with PCP in 1-2 weeks, return to ER if fever >101°F or increased pain..."
              value={formData.discharge_follow_up}
              onChange={(e) => setFormData(prev => ({ ...prev, discharge_follow_up: e.target.value }))}
              className={getErrorForField('discharge_follow_up') ? 'border-destructive' : ''}
              rows={3}
            />
            {getErrorForField('discharge_follow_up') && (
              <p className="text-sm text-destructive">{getErrorForField('discharge_follow_up')?.message}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              'Generate Discharge Summary'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
