
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';

interface PatientToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onAddPatient?: () => void;
  onFaceId?: () => void;
  isAuthenticated?: boolean;
  setIsAddPatientOpen?: (isOpen: boolean) => void;
  setIsFaceIdDialogOpen?: (isOpen: boolean) => void;
}

const PatientToolbar: React.FC<PatientToolbarProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  setSearchQuery,
  onAddPatient,
  onFaceId,
  isAuthenticated = false,
  setIsAddPatientOpen,
  setIsFaceIdDialogOpen
}) => {
  // Handle the case for both old and new prop patterns
  const handleAddPatient = () => {
    if (onAddPatient) {
      onAddPatient();
    } else if (setIsAddPatientOpen) {
      setIsAddPatientOpen(true);
    }
  };
  
  const handleFaceId = () => {
    if (onFaceId) {
      onFaceId();
    } else if (setIsFaceIdDialogOpen) {
      setIsFaceIdDialogOpen(true);
    }
  };

  // Use either searchQuery or filter depending on which is provided
  const searchValue = searchQuery !== undefined ? searchQuery : filter;
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (setSearchQuery) {
      setSearchQuery(value);
    } else {
      onFilterChange(value);
    }
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">Patients</h1>
        <p className="text-muted-foreground">Manage your patients and their records</p>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-8 w-full md:w-[250px]"
          />
        </div>
        
        {isAuthenticated && (
          <>
            <Button variant="outline" onClick={handleFaceId}>
              <User className="mr-2 h-4 w-4" />
              Face ID
            </Button>
            <Button onClick={handleAddPatient}>
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientToolbar;
