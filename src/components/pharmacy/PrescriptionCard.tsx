
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Prescription } from '@/types';

interface PrescriptionCardProps {
  prescription: Prescription;
  onAdminister?: () => void;
  onViewDetails?: () => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onAdminister,
  onViewDetails
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'prescribed':
        return <Badge variant="secondary">Prescribed</Badge>;
      case 'administered':
        return <Badge variant="default" className="bg-green-500">Administered</Badge>;
      case 'discontinued':
        return <Badge variant="destructive">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{prescription.medication_name}</CardTitle>
          {getStatusBadge(prescription.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Dosage:</span>
            <span>{prescription.dosage}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Frequency:</span>
            <span>{prescription.frequency}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(prescription.start_date), 'MMM d, yyyy')}
            {prescription.end_date && ` - ${format(new Date(prescription.end_date), 'MMM d, yyyy')}`}
          </span>
        </div>
        
        {prescription.instructions && (
          <div className="text-sm">
            <span className="font-medium">Instructions: </span>
            <span className="text-muted-foreground">{prescription.instructions}</span>
          </div>
        )}
        
        {prescription.administered_at && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Clock className="h-4 w-4" />
            <span>
              Administered {format(new Date(prescription.administered_at), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {prescription.status === 'prescribed' && onAdminister && (
            <Button onClick={onAdminister} size="sm">
              Administer
            </Button>
          )}
          {onViewDetails && (
            <Button onClick={onViewDetails} variant="outline" size="sm">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;
