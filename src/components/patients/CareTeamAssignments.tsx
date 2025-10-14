import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, UserCircle } from "lucide-react";
import { usePatientAssignments, useUsersByRole, useCreatePatientAssignment, useDeletePatientAssignment } from "@/hooks/usePatientAssignments";
import { useAuth } from "@/context/AuthContext";

interface CareTeamAssignmentsProps {
  patientId: string;
}

const CareTeamAssignments = ({ patientId }: CareTeamAssignmentsProps) => {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'nurse' | 'therapist' | 'cna'>('nurse');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: assignments = [], isLoading } = usePatientAssignments(patientId);
  const { data: availableUsers = [] } = useUsersByRole();
  const createAssignment = useCreatePatientAssignment();
  const deleteAssignment = useDeletePatientAssignment();

  const handleAddAssignment = async () => {
    if (!selectedUserId || !user?.id) return;

    await createAssignment.mutateAsync({
      patient_id: patientId,
      assigned_to: selectedUserId,
      role: selectedRole,
      assigned_by: user.id,
      notes: notes || undefined
    });

    setIsAdding(false);
    setSelectedUserId('');
    setNotes('');
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to remove this care team member?')) {
      await deleteAssignment.mutateAsync(assignmentId);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'doctor': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'nurse': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'therapist': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cna': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default: return '';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading care team...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            Care Team
          </CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign Member
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isAdding && (
          <div className="mb-4 p-4 border rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Role</label>
                <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                    <SelectItem value="therapist">Therapist</SelectItem>
                    <SelectItem value="cna">CNA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Staff Member</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers
                      .filter((u: any) => !assignments.some((a: any) => a.assigned_to === u.id))
                      .map((u: any) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (Optional)</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddAssignment} disabled={!selectedUserId}>
                Add to Team
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsAdding(false);
                setSelectedUserId('');
                setNotes('');
              }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No care team members assigned yet
            </p>
          ) : (
            assignments.map((assignment: any) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.users?.name || 'Unknown'}</div>
                    <div className="text-sm text-muted-foreground">{assignment.users?.email}</div>
                    {assignment.notes && (
                      <div className="text-xs text-muted-foreground mt-1">{assignment.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getRoleBadgeColor(assignment.role)}>
                    {assignment.role}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CareTeamAssignments;
