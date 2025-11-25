import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  is_primary: boolean;
  start_date: string;
  end_date?: string;
  profiles?: {
    name: string;
    email: string;
  };
}

interface Patient {
  id: string;
  name: string | null;
}

export function CareTeamsManager() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Form state
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchTeamMembers();
    }
  }, [selectedPatient]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select('id, name')
      .order('name');
    
    if (data) setPatients(data);
  };

  const fetchStaff = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, role')
      .in('role', ['doctor', 'nurse', 'social_worker', 'therapist', 'pharmacist'])
      .order('name');
    
    if (data) setStaff(data);
  };

  const fetchTeamMembers = async () => {
    const { data } = await supabase
      .from('care_team_members')
      .select(`
        *,
        profiles!care_team_members_user_id_fkey (name, email)
      `)
      .eq('patient_id', selectedPatient)
      .is('end_date', null)
      .order('is_primary', { ascending: false });
    
    if (data) setTeamMembers(data as any);
  };

  const handleAddMember = async () => {
    if (!selectedPatient || !selectedStaff || !selectedRole || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('care_team_members')
        .insert({
          patient_id: selectedPatient,
          user_id: selectedStaff,
          role: selectedRole,
          is_primary: isPrimary,
          start_date: new Date().toISOString().split('T')[0],
          added_by: user.id
        });

      if (error) throw error;

      toast.success('Team member added successfully');
      setShowAddDialog(false);
      setSelectedStaff('');
      setSelectedRole('');
      setIsPrimary(false);
      fetchTeamMembers();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('care_team_members')
        .update({ end_date: new Date().toISOString().split('T')[0] })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Team member removed');
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Patient</CardTitle>
          <CardDescription>Choose a patient to manage their care team</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger>
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPatient && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Care Team Members</CardTitle>
                <CardDescription>Manage the multidisciplinary care team</CardDescription>
              </div>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No team members assigned yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.profiles?.name}</p>
                            {member.is_primary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          <p className="text-xs text-muted-foreground">{member.profiles?.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Assign a healthcare provider to this patient's care team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Staff Member</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} ({s.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Role in Care Team</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Provider">Primary Provider</SelectItem>
                  <SelectItem value="Consulting Physician">Consulting Physician</SelectItem>
                  <SelectItem value="Nursing Care">Nursing Care</SelectItem>
                  <SelectItem value="Social Worker">Social Worker</SelectItem>
                  <SelectItem value="Therapist">Therapist</SelectItem>
                  <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="primary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="primary">Set as primary care provider</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!selectedStaff || !selectedRole || loading}>
              {loading ? 'Adding...' : 'Add to Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
