import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Eye, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import { FacialDataRecord } from '@/types/missing-tables';

interface FacialDataHistoryProps {
  patientId: string;
}

export default function FacialDataHistory({ patientId }: FacialDataHistoryProps) {
  const [records, setRecords] = useState<FacialDataRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacialDataHistory();
  }, [patientId]);

  const fetchFacialDataHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facial_data_history' as any)
        .select('*')
        .eq('patient_id', patientId)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      setRecords((data as FacialDataRecord[]) || []);
    } catch (error) {
      console.error('Error fetching facial data history:', error);
      toast.error('Failed to load facial data history');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'bg-success text-success-foreground';
    if (score >= 0.7) return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading facial data history...</div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No facial recognition history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Facial Recognition History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(record.captured_at), 'PPp')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{record.capture_method || 'Standard'}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getConfidenceColor(record.confidence_score || 0)}>
                    {((record.confidence_score || 0) * 100).toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {record.notes || 'No additional notes'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
