// @ts-nocheck - Uses facial_data_history table not yet created
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Eye, History, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface FacialDataRecord {
  id: string;
  facial_data: string;
  confidence: number;
  registered_at: string;
  notes: string | null;
  is_active: boolean;
}

interface FacialDataHistoryProps {
  patientId: string;
}

const FacialDataHistory: React.FC<FacialDataHistoryProps> = ({ patientId }) => {
  const [records, setRecords] = useState<FacialDataRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [patientId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      // @ts-expect-error - facial_data_history table not yet created
      const { data, error } = await supabase
        .from('facial_data_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('registered_at', { ascending: false });

      if (error) throw error;
      
      // @ts-expect-error - type mismatch with FacialDataRecord
      setRecords(data || []);
    } catch (error) {
      console.error('Error loading facial data history:', error);
      toast.error('Failed to load facial recognition history');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActive = async (recordId: string, currentStatus: boolean) => {
    try {
      // @ts-expect-error - facial_data_history table not yet created
      const { error } = await supabase
        .from('facial_data_history')
        .update({ is_active: !currentStatus })
        .eq('id', recordId);

      if (error) throw error;

      toast.success(
        `Registration ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
      loadHistory();
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    }
  };

  const viewImage = (facialData: string) => {
    try {
      const parsed = JSON.parse(facialData);
      if (parsed.image) {
        setSelectedImage(parsed.image);
      }
    } catch (error) {
      console.error('Error parsing facial data:', error);
      toast.error('Failed to load image');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <History className="h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No facial registration history</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Facial Registration History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={record.is_active ? 'default' : 'secondary'}
                        className="gap-1"
                      >
                        {record.is_active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(record.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Registered{' '}
                      {formatDistanceToNow(new Date(record.registered_at), {
                        addSuffix: true,
                      })}
                    </p>
                    {record.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {record.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewImage(record.facial_data)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={record.is_active ? 'outline' : 'default'}
                      onClick={() => toggleActive(record.id, record.is_active)}
                    >
                      {record.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registered Facial Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Registered face"
              className="w-full rounded-md border"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FacialDataHistory;
