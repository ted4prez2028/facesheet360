
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Scan, Search } from "lucide-react";

interface PatientToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsAddPatientOpen: (isOpen: boolean) => void;
  setIsFaceIdDialogOpen: (isOpen: boolean) => void;
  isAuthenticated: boolean;
}

const PatientToolbar: React.FC<PatientToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  setIsAddPatientOpen,
  setIsFaceIdDialogOpen,
  isAuthenticated,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between">
      <Button
        onClick={() => setIsAddPatientOpen(true)}
        className="flex items-center gap-2"
        disabled={!isAuthenticated}
      >
        <UserPlus size={16} />
        <span>Add New Patient</span>
      </Button>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline"
          onClick={() => setIsFaceIdDialogOpen(true)}
          className="flex items-center gap-2"
          disabled={!isAuthenticated}
        >
          <Scan size={16} />
          <span>Identify by Face</span>
        </Button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full sm:w-[300px]"
          />
        </div>
      </div>
    </div>
  );
};

export default PatientToolbar;
