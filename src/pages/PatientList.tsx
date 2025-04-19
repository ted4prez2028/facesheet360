
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { AddPatientDrawer } from '@/components/patients/AddPatientDrawer';
import PatientsList from '@/components/patients/PatientsList';
import PatientToolbar from '@/components/patients/PatientToolbar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

const PatientListPage = () => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*');
      if (error) throw error;
      return data as Patient[];
    }
  });

  const handleDeletePatient = async (id: string) => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting patient:', error);
      return;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesQuery = patient.first_name.toLowerCase().includes(query.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(query.toLowerCase());
    
    if (filter === 'all') return matchesQuery;
    // Add more filter conditions as needed
    return matchesQuery;
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <PatientToolbar
          searchQuery={query}
          setSearchQuery={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          isAuthenticated={isAuthenticated}
          setIsAddPatientOpen={setIsAddPatientOpen}
          setIsFaceIdDialogOpen={setIsFaceIdDialogOpen}
        />
        <PatientsList
          patients={patients}
          filteredPatients={filteredPatients}
          isLoading={isLoading}
          error={error}
          handleDeletePatient={handleDeletePatient}
        />
        
        {/* Add patient drawer should go here */}
        {/* <AddPatientDrawer open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen} /> */}
        
        {/* Face ID dialog should go here */}
        {/* <FaceIdentificationDialog open={isFaceIdDialogOpen} onOpenChange={setIsFaceIdDialogOpen} /> */}
      </div>
    </DashboardLayout>
  );
};

export default PatientListPage;
