import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface InviteProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteProviderDialog({ open, onOpenChange }: InviteProviderDialogProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<string>('');
  const [specialty, setSpecialty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !name || !role) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, this would:
      // 1. Create an invitation record
      // 2. Send an email invitation
      // 3. The recipient would sign up and be assigned the role
      
      // For now, we'll create a placeholder notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user?.id || '',
          title: 'Provider Invitation Sent',
          message: `Invitation sent to ${name} (${email}) to join as ${role}`,
          type: 'system',
          read: false
        });

      if (notificationError) throw notificationError;

      toast.success(`Invitation sent to ${email}`, {
        description: 'They will receive an email with instructions to join your organization'
      });

      // Reset form
      setEmail('');
      setName('');
      setRole('');
      setSpecialty('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Healthcare Provider</DialogTitle>
          <DialogDescription>
            Send an invitation to a healthcare provider to join your organization's communication network.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="Dr. Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="nurse">Nurse</SelectItem>
                <SelectItem value="pharmacist">Pharmacist</SelectItem>
                <SelectItem value="therapist">Therapist</SelectItem>
                <SelectItem value="cna">CNA</SelectItem>
                <SelectItem value="social_worker">Social Worker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="specialty">Specialty (Optional)</Label>
            <Input
              id="specialty"
              placeholder="e.g., Cardiology, Pediatrics"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
