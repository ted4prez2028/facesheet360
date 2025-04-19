
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Scan, Search } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export interface PatientToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  isAuthenticated?: boolean;
  setIsAddPatientOpen?: (isOpen: boolean) => void;
  setIsFaceIdDialogOpen?: (isOpen: boolean) => void;
}

const PatientToolbar: React.FC<PatientToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  filter,
  onFilterChange,
  isAuthenticated = true,
  setIsAddPatientOpen,
  setIsFaceIdDialogOpen,
}) => {
  const handleButtonClick = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error("Please log in to perform this action", {
        action: {
          label: "Login",
          onClick: () => window.location.href = "/login"
        }
      });
      return;
    }
    action();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between">
      <Button
        onClick={() => setIsAddPatientOpen && handleButtonClick(() => setIsAddPatientOpen(true))}
        className="flex items-center gap-2"
        disabled={!isAuthenticated}
      >
        <UserPlus size={16} />
        <span>Add New Patient</span>
      </Button>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline"
          onClick={() => setIsFaceIdDialogOpen && handleButtonClick(() => setIsFaceIdDialogOpen(true))}
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
            disabled={!isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientToolbar;
