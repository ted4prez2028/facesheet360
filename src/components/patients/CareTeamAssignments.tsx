
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRolePermissions, HealthcareRole } from '@/hooks/useRolePermissions';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface CareTeamMember {
  id: string;
  staff_id: string;
  role: HealthcareRole;
  assigned_at: string;
  name: string;
  email: string;
}

interface CareTeamAssignmentsProps {
  patientId: string;
}

const formSchema = z.object({
  staffId: z.string().uuid(),
  role: z.enum(['doctor', 'nurse', 'therapist', 'cna']),
});

export const CareTeamAssignments: React.FC<CareTeamAssignmentsProps> = ({ patientId }) => {
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { hasRole, assignToPatient, removeFromPatient } = useRolePermissions();
  const { user } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffId: "",
      role: "nurse",
    },
  });

  // Fetch care team
  const fetchCareTeam = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('get-care-team', {
        body: { patientId }
      });

      if (error) throw error;

      setCareTeam(data || []);
    } catch (error) {
      console.error('Error fetching care team:', error);
      toast.error('Failed to load care team information');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available staff that aren't already assigned
  const fetchAvailableStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email');

      if (error) throw error;

      const assignedStaffIds = careTeam.map(member => member.staff_id);
      const available = data.filter(staff => !assignedStaffIds.includes(staff.id));
      
      setAvailableStaff(available);
    } catch (error) {
      console.error('Error fetching available staff:', error);
      toast.error('Failed to load available staff');
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchCareTeam();
    }
  }, [patientId]);

  useEffect(() => {
    if (isAddDialogOpen) {
      fetchAvailableStaff();
    }
  }, [isAddDialogOpen, careTeam]);

  const handleAddStaff = async (values: z.infer<typeof formSchema>) => {
    const result = await assignToPatient(values.staffId, patientId, values.role);
    if (result) {
      setIsAddDialogOpen(false);
      form.reset();
      fetchCareTeam();
    }
  };

  const handleRemoveStaff = async (assignmentId: string) => {
    if (confirm('Are you sure you want to remove this staff member from the care team?')) {
      const success = await removeFromPatient(assignmentId);
      if (success) {
        fetchCareTeam();
      }
    }
  };

  const canManageTeam = hasRole('doctor') || hasRole('admin');

  const getRoleBadge = (role: HealthcareRole) => {
    const colorMap = {
      doctor: 'bg-blue-100 text-blue-800 border-blue-200',
      nurse: 'bg-green-100 text-green-800 border-green-200',
      therapist: 'bg-purple-100 text-purple-800 border-purple-200',
      cna: 'bg-amber-100 text-amber-800 border-amber-200',
      admin: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <Badge variant="outline" className={colorMap[role]}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Care Team</CardTitle>
          <CardDescription>Healthcare professionals assigned to this patient</CardDescription>
        </div>
        {canManageTeam && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Assign Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Staff to Patient</DialogTitle>
                <DialogDescription>
                  Add a healthcare professional to this patient's care team.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddStaff)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="staffId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Member</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a staff member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableStaff.map(staff => (
                              <SelectItem key={staff.id} value={staff.id}>
                                {staff.name} ({staff.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="nurse">Nurse</SelectItem>
                            <SelectItem value="therapist">Therapist</SelectItem>
                            <SelectItem value="cna">CNA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Assign
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading care team...</div>
        ) : careTeam.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No healthcare professionals are currently assigned to this patient.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
                {canManageTeam && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {careTeam.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell>{new Date(member.assigned_at).toLocaleDateString()}</TableCell>
                  {canManageTeam && (
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveStaff(member.id)}
                        disabled={member.staff_id === user?.id} // Can't remove yourself
                      >
                        Remove
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
