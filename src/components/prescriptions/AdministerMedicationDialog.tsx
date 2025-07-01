
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Prescription } from '@/types';

interface AdministerMedicationDialogProps {
  prescription: Prescription;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdminister: (administrationData: {
    administeredAt: Date;
    notes?: string;
  }) => void;
}

const AdministerMedicationDialog: React.FC<AdministerMedicationDialogProps> = ({
  prescription,
  open,
  onOpenChange,
  onAdminister
}) => {
  const [administeredAt, setAdministeredAt] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAdminister({
        administeredAt,
        notes: notes.trim() || undefined
      });
      onOpenChange(false);
      setNotes('');
      setAdministeredAt(new Date());
    } catch (error) {
      console.error('Error administering medication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Administer Medication</DialogTitle>
          <DialogDescription>
            Record the administration of {prescription.medication_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Medication Details</Label>
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <div className="font-medium">{prescription.medication_name}</div>
              <div className="text-sm text-muted-foreground">
                Dosage: {prescription.dosage} | Frequency: {prescription.frequency}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Administration Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !administeredAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {administeredAt ? (
                    format(administeredAt, "PPP 'at' p")
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={administeredAt}
                  onSelect={(date) => date && setAdministeredAt(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Administration Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about the administration..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Clock className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Recording...' : 'Record Administration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdministerMedicationDialog;
