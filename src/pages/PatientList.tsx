
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
import { Users } from 'lucide-react';
import { toast } from 'sonner';

const PatientListPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const { data: patients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!user
  });

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

  const filteredPatients = patients.filter(patient => {
    const matchesQuery = patient.name?.toLowerCase().includes(query.toLowerCase()) ||
      patient.medical_record_number?.toLowerCase().includes(query.toLowerCase()) ||
      patient.email?.toLowerCase().includes(query.toLowerCase());
    
    if (filter === 'all') return matchesQuery;
    // Add more filter conditions as needed
    return matchesQuery;
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

        <PatientToolbar
          filter={query}
          onFilterChange={setQuery}
          isAuthenticated={isAuthenticated}
          setIsAddPatientOpen={setIsAddPatientOpen}
          setIsFaceIdDialogOpen={setIsFaceIdDialogOpen}
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
    </div>
  );
};

export default PatientListPage;
