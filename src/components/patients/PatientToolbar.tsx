
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, User } from 'lucide-react';

interface PatientToolbarProps {
  filter: string;
  onFilterChange: (value: string) => void;
  onAddPatient: () => void;
  onFaceId: () => void;
  isAuthenticated: boolean;
}

const PatientToolbar: React.FC<PatientToolbarProps> = ({
  filter,
  onFilterChange,
  onAddPatient,
  onFaceId,
  isAuthenticated
}) => {
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
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="pl-8 w-full md:w-[250px]"
          />
        </div>
        
        {isAuthenticated && (
          <>
            <Button variant="outline" onClick={onFaceId}>
              <User className="mr-2 h-4 w-4" />
              Face ID
            </Button>
            <Button onClick={onAddPatient}>
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
