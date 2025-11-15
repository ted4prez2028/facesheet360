// @ts-nocheck - Missing ip_address column in audit_logs table
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

const AuditLogs = () => {
  const { user } = useAuth();

  // Check if user is admin
  const { data: isAdmin, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    },
    enabled: !!user
  });

  const { data: auditLogs, isLoading, error: queryError } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Audit logs query error:', error);
        throw error;
      }
      console.log('Audit logs fetched:', data?.length, 'records');
      return data;
    },
    enabled: isAdmin === true
  });

  // Show loading while checking admin status
  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Checking permissions...
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user || isAdmin === false) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleExport = () => {
    if (!auditLogs) return;
    
    const csv = [
      ['Timestamp', 'Event Type', 'User ID', 'Patient ID', 'Resource ID', 'IP Address', 'Details'].join(','),
      ...auditLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.event_type,
        log.user_id || '',
        log.patient_id || '',
        log.resource_id || '',
        log.ip_address || '',
        JSON.stringify(log.action_details || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Audit logs exported');
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
            <p className="text-sm text-muted-foreground mt-1">Showing most recent 500 logs</p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={!auditLogs?.length}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

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
          {auditLogs?.map((log) => (
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

          {auditLogs?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No audit logs found
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
