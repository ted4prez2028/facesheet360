
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { AddPatientDrawer } from '@/components/patients/AddPatientDrawer';
import PatientsList from '@/components/patients/PatientsList';
import PatientToolbar from '@/components/patients/PatientToolbar';
import { EnhancedPatientCard } from '@/components/patients/EnhancedPatientCard';
import { PatientCardSkeleton } from '@/components/ui/SkeletonLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PatientFilters, PatientFilterOptions } from '@/components/patients/PatientFilters';
import { BulkImportDialog } from '@/components/patients/BulkImportDialog';
import FaceIdentificationDialog from '@/components/facial-recognition/FaceIdentificationDialog';

const PatientListPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [filters, setFilters] = useState<PatientFilterOptions>({});
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: patientsData = { patients: [], assignments: [] }, isLoading, error, refetch } = useQuery({
    queryKey: ['patients-with-assignments'],
    queryFn: async () => {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (patientsError) throw patientsError;
      
      // Fetch care team assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('care_team_members')
        .select('patient_id, user_id, role, is_primary');
      
      if (assignmentsError) throw assignmentsError;
      
      return {
        patients: patientsData as Patient[],
        assignments: assignmentsData || []
      };
    },
    enabled: !!user
  });

  const patients = patientsData.patients;
  const assignments = patientsData.assignments;

  const handleDeletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Patient deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredPatients = patients.filter(patient => {
    // Search query filter
    const matchesQuery = patient.name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.medical_record_number?.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase());
    
    if (!matchesQuery) return false;

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (patient.status !== filters.status) return false;
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'all') {
      if (patient.gender !== filters.gender) return false;
    }

    // Age range filter
    if (patient.date_of_birth) {
      const age = calculateAge(patient.date_of_birth);
      if (filters.ageMin !== undefined && age < filters.ageMin) return false;
      if (filters.ageMax !== undefined && age > filters.ageMax) return false;
    }

    // Assigned provider filter
    if (filters.assignedProvider) {
      const patientAssignments = assignments.filter(a => a.patient_id === patient.id);
      const isAssigned = patientAssignments.some(a => a.user_id === filters.assignedProvider);
      if (!isAssigned) return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
            <p className="text-muted-foreground">
              Manage patient records securely and efficiently
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <PatientToolbar
            filter={query}
            onFilterChange={setQuery}
            isAuthenticated={isAuthenticated}
            setIsAddPatientOpen={setIsAddPatientOpen}
            setIsFaceIdDialogOpen={setIsFaceIdDialogOpen}
          />
          
          <Button
            onClick={() => setIsBulkImportOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </div>

        <PatientFilters 
          onFilterChange={setFilters}
          providers={[]} 
        />
        
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <PatientCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive">
            <CardContent className="py-12 text-center">
              <p className="text-destructive">Failed to load patients</p>
              <Button onClick={() => refetch()} className="mt-4" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredPatients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patients found"
            description={query ? "Try adjusting your search filters" : "Get started by adding your first patient"}
            actionLabel={!query ? "Add Patient" : undefined}
            onAction={!query ? () => setIsAddPatientOpen(true) : undefined}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <EnhancedPatientCard
                key={patient.id}
                patient={patient}
                onView={(id) => navigate(`/patients/${id}`)}
                onDelete={handleDeletePatient}
              />
            ))}
          </div>
        )}
        
        <AddPatientDrawer 
          open={isAddPatientOpen} 
          onOpenChange={setIsAddPatientOpen} 
          onPatientAdded={() => refetch()} 
        />

        <BulkImportDialog
          open={isBulkImportOpen}
          onOpenChange={setIsBulkImportOpen}
          onImportComplete={() => refetch()}
        />

        <FaceIdentificationDialog
          isOpen={isFaceIdDialogOpen}
          onClose={() => setIsFaceIdDialogOpen(false)}
          onIdentificationSuccess={(patientId) => navigate(`/patients/${patientId}`)}
        />
    </div>
  );
};

export default PatientListPage;
