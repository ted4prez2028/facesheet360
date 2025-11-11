import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Heart, 
  Pill, 
  FileText, 
  Microscope,
  Stethoscope,
  Activity,
  Syringe,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';

export interface TimelineEventData {
  id: string;
  type: 'vital' | 'medication' | 'lab' | 'procedure' | 'note' | 'imaging' | 'wound';
  timestamp: Date;
  title: string;
  description: string;
  details?: any;
  recordedBy?: string;
}

interface TimelineEventProps {
  event: TimelineEventData;
  isLast?: boolean;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, isLast }) => {
  const getIcon = () => {
    switch (event.type) {
      case 'vital':
        return <Heart className="h-4 w-4" />;
      case 'medication':
        return <Pill className="h-4 w-4" />;
      case 'lab':
        return <Microscope className="h-4 w-4" />;
      case 'procedure':
        return <Stethoscope className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      case 'imaging':
        return <Activity className="h-4 w-4" />;
      case 'wound':
        return <Camera className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getColor = () => {
    switch (event.type) {
      case 'vital':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'medication':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'lab':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'procedure':
        return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'note':
        return 'text-gray-500 bg-gray-50 border-gray-200';
      case 'imaging':
        return 'text-cyan-500 bg-cyan-50 border-cyan-200';
      case 'wound':
        return 'text-orange-500 bg-orange-50 border-orange-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getBadgeVariant = () => {
    switch (event.type) {
      case 'vital':
        return 'destructive' as const;
      case 'medication':
        return 'default' as const;
      case 'lab':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <div className="relative flex gap-4 pb-8">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-px h-full bg-border" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center ${getColor()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h4 className="font-semibold">{event.title}</h4>
            <p className="text-sm text-muted-foreground">
              {format(event.timestamp, 'PPpp')}
            </p>
          </div>
          <Badge variant={getBadgeVariant()}>
            {event.type}
          </Badge>
        </div>

        <Card className="p-4">
          <p className="text-sm mb-2">{event.description}</p>
          
          {event.details && (
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(event.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {event.recordedBy && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              Recorded by: {event.recordedBy}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TimelineEvent;
