/**
 * HIPAA Audit Logs Page
 * View and filter audit trail for compliance
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileDown, Search, Shield } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs', dateRange],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      let query = supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === 'all' || log.event_type === eventTypeFilter;
    
    return matchesSearch && matchesEventType;
  });

  const uniqueEventTypes = [...new Set(logs?.map(log => log.event_type) || [])];

  const handleExport = () => {
    if (!filteredLogs) return;

    const csv = [
      ['Timestamp', 'Event Type', 'User ID', 'Patient ID', 'Resource ID', 'IP Address', 'Details'],
      ...filteredLogs.map(log => [
        log.created_at,
        log.event_type,
        log.user_id || '',
        log.patient_id || '',
        log.resource_id || '',
        log.ip_address || '',
        JSON.stringify(log.action_details || {})
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getEventBadgeVariant = (eventType: string) => {
    if (eventType.includes('create')) return 'default';
    if (eventType.includes('update')) return 'secondary';
    if (eventType.includes('delete')) return 'destructive';
    if (eventType.includes('view') || eventType.includes('access')) return 'outline';
    return 'default';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">HIPAA Audit Logs</h1>
            <p className="text-muted-foreground">Complete audit trail of system access and changes</p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={!filteredLogs?.length}>
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {uniqueEventTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading audit logs...
          </CardContent>
        </Card>
      ) : filteredLogs && filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={getEventBadgeVariant(log.event_type)}>
                      {log.event_type}
                    </Badge>
                    <CardTitle className="text-sm font-medium">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="font-mono text-xs">{log.user_id?.substring(0, 8)}...</p>
                  </div>
                  {log.patient_id && (
                    <div>
                      <p className="text-muted-foreground">Patient ID</p>
                      <p className="font-mono text-xs">{log.patient_id.substring(0, 8)}...</p>
                    </div>
                  )}
                  {log.resource_id && (
                    <div>
                      <p className="text-muted-foreground">Resource ID</p>
                      <p className="font-mono text-xs">{log.resource_id}</p>
                    </div>
                  )}
                  {log.ip_address && (
                    <div>
                      <p className="text-muted-foreground">IP Address</p>
                      <p className="font-mono text-xs">{log.ip_address}</p>
                    </div>
                  )}
                </div>
                {log.action_details && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-muted-foreground text-sm mb-1">Action Details</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(log.action_details, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No audit logs found for the selected filters
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuditLogs;
