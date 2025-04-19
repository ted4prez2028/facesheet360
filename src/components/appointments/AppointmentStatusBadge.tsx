
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: string;
  className?: string;
}

const AppointmentStatusBadge = ({ status, className }: AppointmentStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 'confirmed':
        return "bg-green-50 text-green-700 border-green-200";
      case 'in-progress':
        return "bg-purple-50 text-purple-700 border-purple-200";
      case 'completed':
        return "bg-gray-50 text-gray-700 border-gray-200";
      case 'cancelled':
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(getStatusColor(status), className)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export default AppointmentStatusBadge;
