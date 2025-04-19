
import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientsList from '@/components/patients/PatientsList';
import AddPatientDrawer from '@/components/patients/AddPatientDrawer';
import PatientToolbar from '@/components/patients/PatientToolbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const PatientList = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  
  const { patients, isLoading, error, refetch } = usePatients();
  
  const filteredPatients = patients?.filter(patient => {
    const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    
    if (currentFilter === 'all') return matchesSearch;
    // Add additional filters as needed
    return matchesSearch;
  });

  const handleAddPatientSuccess = () => {
    setIsAddPatientOpen(false);
    refetch();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Patients</h1>
          <Button 
            onClick={() => setIsAddPatientOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Add Patient
          </Button>
        </div>
        
        <PatientToolbar 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
        
        <PatientsList 
          patients={filteredPatients || []}
          isLoading={isLoading}
          error={error}
        />
        
        <AddPatientDrawer
          open={isAddPatientOpen}
          onOpenChange={setIsAddPatientOpen}
          onSuccess={handleAddPatientSuccess}
        />
      </div>
    </DashboardLayout>
  );
};

export default PatientList;
