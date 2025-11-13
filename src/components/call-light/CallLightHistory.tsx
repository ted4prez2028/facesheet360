
import React, { useEffect, useState } from 'react';
import { CallLightRequest } from '@/types';
import { getPatientCallLightHistory } from '@/lib/api/callLightApi';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Check, Clock, Pill, Bath, Droplets, HelpCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CallLightHistoryProps {
  patientId: string;
}

const CallLightHistory: React.FC<CallLightHistoryProps> = ({ patientId }) => {
  const [history, setHistory] = useState<CallLightRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      try {
        const data = await getPatientCallLightHistory(patientId);
        setHistory(data);
      } catch (error) {
        console.error("Error fetching call light history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">Active</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getRequestTypeIcon = (type: string) => {
    switch(type) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pain':
        return <Pill className="h-4 w-4 text-red-400" />;
      case 'bathroom':
        return <Bath className="h-4 w-4 text-blue-500" />;
      case 'water':
        return <Droplets className="h-4 w-4 text-blue-400" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <div className="flex flex-col items-center justify-center">
          <Bell className="h-8 w-8 mb-4 text-muted-foreground/50" />
          <p>No call light history</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((item) => (
        <div 
          key={item.id} 
          className={`
            border rounded-md p-3 
            ${item.status === 'completed' ? 'border-gray-200' : ''}
            ${item.status === 'active' ? 'border-amber-300 bg-amber-50' : ''}
            ${item.status === 'in_progress' ? 'border-blue-300 bg-blue-50' : ''}
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getRequestTypeIcon(item.request_type)}
              <span className="font-medium capitalize">{item.request_type}</span>
            </div>
            {getStatusBadge(item.status)}
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            <span>
              Requested {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </span>
          </div>
          
          {item.status === 'completed' && item.completed_at && (
            <div className="text-sm text-green-600 flex items-center gap-2 mt-1">
              <Check className="h-3.5 w-3.5" />
              <span>
                Completed {format(new Date(item.completed_at), 'MMM d, h:mm a')}
              </span>
            </div>
          )}
          
          {item.message && (
            <div className="mt-2 text-sm border-l-2 border-gray-300 pl-2">
              {item.message}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CallLightHistory;
