
import { MoreHorizontal, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { User, FileText, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PatientDetailHeaderProps {
  patientName: string | undefined;
  patientId: string | undefined;
  patientAge: number | undefined;
}

const PatientDetailHeader = ({
  patientName,
  patientId,
  patientAge
}: PatientDetailHeaderProps) => {
  const navigate = useNavigate();

  const handleSchedule = () => {
    if (patientId) {
      navigate(`/appointments?patientId=${patientId}`);
    } else {
      navigate('/appointments');
    }
  };

  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>{patientName}</CardTitle>
        <CardDescription>
          {patientId?.substring(0, 8)} • {patientAge} years old
        </CardDescription>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" size="sm" onClick={handleSchedule}>
          <Calendar className="h-4 w-4" />
          <span>Schedule</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              <span>Full History</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Activity className="h-4 w-4 mr-2" />
              <span>Vital Signs</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default PatientDetailHeader;
