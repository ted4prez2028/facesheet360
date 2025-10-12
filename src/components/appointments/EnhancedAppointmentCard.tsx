/**
 * Enhanced Appointment Card with Modern Features
 */

import { format } from 'date-fns';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface EnhancedAppointmentCardProps {
  appointment: {
    id: string;
    patientName: string;
    patientId: string;
    date: Date;
    type: string;
    duration: number;
    notes?: string;
    status?: string;
  };
  onCheckIn?: (id: string) => void;
  onViewChart?: (patientId: string) => void;
  onCancel?: (id: string) => void;
}

export const EnhancedAppointmentCard = ({
  appointment,
  onCheckIn,
  onViewChart,
  onCancel
}: EnhancedAppointmentCardProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('urgent')) return 'destructive';
    if (lowerType.includes('follow')) return 'secondary';
    return 'default';
  };

  const initials = appointment.patientName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {appointment.patientName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{format(appointment.date, 'h:mm a')}</span>
                <span>•</span>
                <span>{appointment.duration} min</span>
              </div>
            </div>
          </div>
          <Badge variant={getTypeColor(appointment.type)} className="ml-2">
            {appointment.type}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(appointment.date, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          {appointment.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {appointment.notes}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => onViewChart?.(appointment.patientId)}
        >
          View Chart
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onCheckIn?.(appointment.id)}
        >
          Check In
        </Button>
      </CardFooter>
    </Card>
  );
};
