import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientProfile } from '@/hooks/usePatientProfile';
import { useUpdatePatient } from '@/hooks/usePatientMutation';
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ProfileTabProps {
  patientId: string;
}

interface PersonalInfoForm {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface InsuranceInfoForm {
  insurance_provider: string;
  insurance_policy_number: string;
  medical_record_number: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ patientId }) => {
  const { data: patient, isLoading } = usePatientProfile(patientId);
  const updatePatient = useUpdatePatient(patientId);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(false);

  const personalForm = useForm<PersonalInfoForm>({
    defaultValues: {
      first_name: patient?.first_name || '',
      last_name: patient?.last_name || '',
      date_of_birth: patient?.date_of_birth || '',
      gender: patient?.gender || '',
      email: patient?.email || '',
      phone: patient?.phone || '',
      address: patient?.address || '',
      emergency_contact_name: patient?.emergency_contact_name || '',
      emergency_contact_phone: patient?.emergency_contact_phone || ''
    }
  });

  const insuranceForm = useForm<InsuranceInfoForm>({
    defaultValues: {
      insurance_provider: patient?.insurance_provider || '',
      insurance_policy_number: patient?.insurance_number || '',
      medical_record_number: patient?.medical_record_number || ''
    }
  });

  React.useEffect(() => {
    if (patient) {
      personalForm.reset({
        first_name: patient.first_name || '',
        last_name: patient.last_name || '',
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        email: patient.email || '',
        phone: patient.phone || '',
        address: patient.address || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || ''
      });
      insuranceForm.reset({
        insurance_provider: patient.insurance_provider || '',
        insurance_policy_number: patient.insurance_number || '',
        medical_record_number: patient.medical_record_number || ''
      });
    }
  }, [patient]);

  const handleSavePersonal = async (data: PersonalInfoForm) => {
    try {
      console.log('Saving personal info:', data);
      console.log('Patient ID:', patientId);
      
      // Map form fields to database fields
      const dbData = {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        email: data.email,
        phone: data.phone,
        address: data.address,
        emergency_contact: data.emergency_contact_name,
        emergency_phone: data.emergency_contact_phone
      };
      
      console.log('Mapped database data:', dbData);
      await updatePatient.mutateAsync(dbData);
      console.log('Update successful, closing form');
      setEditingPersonal(false);
    } catch (error) {
      console.error('Error saving personal info:', error);
      // Error toast is already handled by the mutation's onError
    }
  };

  const handleSaveInsurance = async (data: InsuranceInfoForm) => {
    try {
      console.log('Saving insurance info:', data);
      console.log('Patient ID:', patientId);
      await updatePatient.mutateAsync(data);
      console.log('Insurance update successful, closing form');
      setEditingInsurance(false);
    } catch (error) {
      console.error('Error saving insurance info:', error);
      // Error toast is already handled by the mutation's onError
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Patient's personal and contact details</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingPersonal(!editingPersonal)}
          >
            {editingPersonal ? <X className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
            {editingPersonal ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent>
          {editingPersonal ? (
            <form onSubmit={personalForm.handleSubmit(handleSavePersonal)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...personalForm.register('first_name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...personalForm.register('last_name', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input id="date_of_birth" type="date" {...personalForm.register('date_of_birth', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select onValueChange={(value) => personalForm.setValue('gender', value)} defaultValue={personalForm.getValues('gender')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...personalForm.register('email')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...personalForm.register('phone')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" {...personalForm.register('address')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Emergency Contact</Label>
                  <Input id="emergency_contact_name" {...personalForm.register('emergency_contact_name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Emergency Phone</Label>
                  <Input id="emergency_contact_phone" {...personalForm.register('emergency_contact_phone')} />
                </div>
              </div>
              <Button type="submit" disabled={updatePatient.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                  <dd className="text-base">{patient.first_name} {patient.last_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                  <dd className="text-base">{new Date(patient.date_of_birth).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                  <dd className="text-base">{patient.gender}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Emergency Contact</dt>
                  <dd className="text-base">{patient.emergency_contact_name || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Emergency Phone</dt>
                  <dd className="text-base">{patient.emergency_contact_phone || 'Not provided'}</dd>
                </div>
              </dl>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-base">{patient.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-base">{patient.phone || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="text-base">{patient.address || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Insurance Information</CardTitle>
            <CardDescription>Patient's insurance details</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingInsurance(!editingInsurance)}
          >
            {editingInsurance ? <X className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
            {editingInsurance ? 'Cancel' : 'Edit'}
          </Button>
        </CardHeader>
        <CardContent>
          {editingInsurance ? (
            <form onSubmit={insuranceForm.handleSubmit(handleSaveInsurance)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insurance_provider">Insurance Provider</Label>
                  <Input id="insurance_provider" {...insuranceForm.register('insurance_provider')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurance_policy_number">Policy Number</Label>
                  <Input id="insurance_policy_number" {...insuranceForm.register('insurance_policy_number')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="medical_record_number">Medical Record Number</Label>
                  <Input id="medical_record_number" {...insuranceForm.register('medical_record_number')} />
                </div>
              </div>
              <Button type="submit" disabled={updatePatient.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updatePatient.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          ) : (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Insurance Provider</dt>
                <dd className="text-base">{patient.insurance_provider || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Policy Number</dt>
                <dd className="text-base">{patient.insurance_number || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Medical Record Number</dt>
                <dd className="text-base">{patient.medical_record_number || 'Not provided'}</dd>
              </div>
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
