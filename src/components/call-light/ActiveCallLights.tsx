
import React from 'react';
import { CallLightRequest } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ActiveCallLightsProps {
  callLights: CallLightRequest[];
  isLoading: boolean;
  onRespond: (id: string) => void;
  onComplete: (id: string) => void;
}

const ActiveCallLights: React.FC<ActiveCallLightsProps> = ({ 
  callLights, 
  isLoading, 
  onRespond, 
  onComplete 
}) => {
  const getRequestTypeBadge = (type: string) => {
    switch(type) {
      case 'emergency':
        return <Badge variant="destructive" className="uppercase">{type}</Badge>;
      case 'pain':
        return <Badge variant="destructive" className="bg-red-500">{type}</Badge>;
      case 'bathroom':
        return <Badge variant="secondary" className="bg-blue-500 text-white">{type}</Badge>;
      case 'water':
        return <Badge variant="secondary" className="bg-blue-300">{type}</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-2/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-24 mr-2" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (callLights.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center">
          <Bell className="h-8 w-8 mb-4 text-muted-foreground/50" />
          <p>No active call lights</p>
        </div>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-3">
      <div className="space-y-3">
        {callLights.map((callLight) => {
          const patient = callLight.patients;
          const patientName = patient 
            ? `${patient.first_name} ${patient.last_name}` 
            : 'Unknown Patient';
            
          return (
            <Card key={callLight.id} className={`
              ${callLight.request_type === 'emergency' ? 'border-red-500 shadow-md shadow-red-100' : ''}
              ${callLight.status === 'in_progress' ? 'bg-amber-50' : ''}
            `}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Room {callLight.room_number}</span>
                  {getRequestTypeBadge(callLight.request_type)}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-start gap-2 mb-1">
                  <User className="h-4 w-4 mt-0.5" />
                  <span>{patientName}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mt-0.5" />
                  <span>{formatDistanceToNow(new Date(callLight.created_at), { addSuffix: true })}</span>
                </div>
                {callLight.message && (
                  <p className="mt-2 text-sm border-l-2 border-primary pl-2">{callLight.message}</p>
                )}
              </CardContent>
              <CardFooter>
                {callLight.status === 'active' ? (
                  <Button size="sm" onClick={() => onRespond(callLight.id)} className="mr-2">
                    Respond
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled className="mr-2">
                    Responding
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant={callLight.status === 'in_progress' ? 'default' : 'outline'} 
                  onClick={() => onComplete(callLight.id)}
                >
                  Complete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ActiveCallLights;
