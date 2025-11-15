// @ts-nocheck
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Search, Download, Filter, Calendar } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuditLogs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('7days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRangeFilter) {
      case '1day':
        return { start: subDays(now, 1), end: now };
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'custom':
        if (customStartDate && customEndDate) {
          return {
            start: startOfDay(new Date(customStartDate)),
            end: endOfDay(new Date(customEndDate))
          };
        }
        return { start: subDays(now, 7), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  };

  // Fetch audit logs directly - RLS policies will handle access control
  const { data: auditLogs, isLoading, error: queryError } = useQuery({
    queryKey: ['auditLogs', dateRangeFilter, customStartDate, customEndDate],
    queryFn: async () => {
      if (!user) {
        console.log('No user, skipping audit logs fetch');
        return [];
      }
      
      const dateRange = getDateRange();
      console.log('Fetching audit logs for user:', user.id, 'dateRange:', dateRange);
      
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Audit logs query error:', error);
        throw error;
      }
      console.log('Audit logs fetched:', data?.length, 'records');
      return data;
    },
    enabled: !!user
  });

  // Show loading while checking user
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredLogs = auditLogs?.filter((log) => {
    const matchesSearch = !searchTerm || 
      log.event_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEventType = eventTypeFilter === 'all' || 
      log.event_type?.includes(eventTypeFilter);
    
    return matchesSearch && matchesEventType;
  }) || [];

  const uniqueEventTypes = Array.from(new Set(
    auditLogs?.map(log => log.event_type?.split('_')[0]).filter(Boolean) || []
  ));

  const handleExport = () => {
    if (!filteredLogs?.length) return;
    
    const csv = [
      ['Timestamp', 'Event Type', 'User ID', 'Patient ID', 'Resource ID', 'IP Address', 'Details'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.event_type,
        log.user_id || '',
        log.patient_id || '',
        log.resource_id || '',
        log.ip_address || '',
        JSON.stringify(log.action_details || {}).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    toast.success(`Exported ${filteredLogs.length} audit logs`);
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
            <p className="text-sm text-muted-foreground mt-1">
              Showing {filteredLogs.length} of {auditLogs?.length || 0} logs
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={!filteredLogs?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {uniqueEventTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1day">Last 24 Hours</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRangeFilter === 'custom' && (
              <div className="space-y-2">
                <Label>Custom Dates</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {queryError && (
        <Card className="border-destructive">
          <CardContent className="py-6 text-center">
            <p className="text-destructive font-semibold mb-2">Error loading audit logs</p>
            <p className="text-sm text-muted-foreground">{queryError.message}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading audit logs...
          </CardContent>
        </Card>
      ) : !queryError && (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={getEventBadgeVariant(log.event_type)}>
                        {log.event_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'PPpp')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {log.user_id && (
                        <div>
                          <span className="text-muted-foreground">User ID:</span>
                          <p className="font-mono text-xs">{log.user_id}</p>
                        </div>
                      )}
                      {log.patient_id && (
                        <div>
                          <span className="text-muted-foreground">Patient ID:</span>
                          <p className="font-mono text-xs">{log.patient_id}</p>
                        </div>
                      )}
                      {log.resource_id && (
                        <div>
                          <span className="text-muted-foreground">Resource ID:</span>
                          <p className="font-mono text-xs">{log.resource_id}</p>
                        </div>
                      )}
                      {log.ip_address && (
                        <div>
                          <span className="text-muted-foreground">IP Address:</span>
                          <p className="font-mono text-xs">{String(log.ip_address)}</p>
                        </div>
                      )}
                    </div>

                    {log.action_details && typeof log.action_details === 'object' && (
                      <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.action_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredLogs.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No logs match your filters
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
