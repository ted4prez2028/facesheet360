/**
 * Enhanced Patient Card with Modern Design
 */

import { Patient } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, Mail, FileText, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface EnhancedPatientCardProps {
  patient: Patient;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const EnhancedPatientCard = ({
  patient,
  onView,
  onEdit,
  onDelete
}: EnhancedPatientCardProps) => {
  const navigate = useNavigate();

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

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(patient.name);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">
                {patient.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{calculateAge(patient.date_of_birth)} years</span>
                <span>•</span>
                <span>{patient.gender}</span>
              </div>
              {patient.medical_record_number && (
                <Badge variant="outline" className="mt-1 text-xs">
                  MRN: {patient.medical_record_number}
                </Badge>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(patient.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(patient.id)}>
                Edit Patient
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(patient.id)}
                className="text-destructive"
              >
                Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 text-sm">
          {patient.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.phone}</span>
            </div>
          )}
          {patient.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
        </div>

        {patient.allergies && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-md">
            <div className="text-xs font-medium text-destructive mb-1">Allergies</div>
            <div className="text-sm">{patient.allergies}</div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate(`/patients/${patient.id}`)}
        >
          <FileText className="h-4 w-4 mr-2" />
          Chart
        </Button>
        <Button 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`/appointments?patient=${patient.id}`)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
      </CardFooter>
    </Card>
  );
};
