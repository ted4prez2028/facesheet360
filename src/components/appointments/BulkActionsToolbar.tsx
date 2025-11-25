import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onSuccess: () => void;
}

export function BulkActionsToolbar({ selectedIds, onClearSelection, onSuccess }: BulkActionsToolbarProps) {
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`Updated ${selectedIds.length} appointments to ${status}`);
      onSuccess();
      onClearSelection();
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update appointments');
    }
  };

  const handleBulkReminders = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-appointment-reminders', {
        body: { appointmentIds: selectedIds }
      });

      if (error) throw error;

      toast.success(`Sent reminders for ${selectedIds.length} appointments`);
      onClearSelection();
    } catch (error) {
      console.error('Bulk reminder error:', error);
      toast.error('Failed to send reminders');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to cancel ${selectedIds.length} appointments?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .in('id', selectedIds);

      if (error) throw error;

      toast.success(`Cancelled ${selectedIds.length} appointments`);
      onSuccess();
      onClearSelection();
    } catch (error) {
      console.error('Bulk cancel error:', error);
      toast.error('Failed to cancel appointments');
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border shadow-lg rounded-lg p-4 flex items-center gap-4 z-40">
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>

      <Select onValueChange={handleBulkStatusUpdate}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Update status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="confirmed">Confirm</SelectItem>
          <SelectItem value="completed">Complete</SelectItem>
          <SelectItem value="no-show">Mark No-Show</SelectItem>
          <SelectItem value="cancelled">Cancel</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleBulkReminders} variant="secondary" size="sm">
        <Send className="h-4 w-4 mr-2" />
        Send Reminders
      </Button>

      <Button onClick={handleBulkDelete} variant="destructive" size="sm">
        <X className="h-4 w-4 mr-2" />
        Cancel Selected
      </Button>

      <Button onClick={onClearSelection} variant="ghost" size="sm">
        Clear
      </Button>
    </div>
  );
}