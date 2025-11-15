// @ts-nocheck - Type instantiation issues
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Eye, FileText, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { format } from 'date-fns';

export default function ComplianceCenter() {
  // Fetch PHI access logs
  const { data: phiLogs = [] } = useQuery({
    queryKey: ['phi-access-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phi_access_logs')
        .select('*')
        .order('accessed_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch data retention policies
  const { data: retentionPolicies = [] } = useQuery({
    queryKey: ['retention-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_retention_policies')
        .select('*')
        .eq('active', true)
        .order('data_type');
      if (error) throw error;
      return data;
    },
  });

  // Fetch patient consents
  const { data: consents = [] } = useQuery({
    queryKey: ['patient-consents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_consents')
        .select('*, patients(*)')
        .order('consent_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const emergencyAccesses = phiLogs.filter((log: any) => log.emergency_access);
  const expiringSoonConsents = consents.filter((c: any) => {
    if (!c.expiration_date) return false;
    const daysUntilExpiry = Math.floor((new Date(c.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HIPAA Compliance Center</h1>
        <p className="text-muted-foreground">Enhanced security, audit trails, and consent management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              PHI Access Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{phiLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 100 events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{emergencyAccesses.length}</div>
            <p className="text-xs text-muted-foreground">Break-the-glass events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Expiring Consents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{expiringSoonConsents.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="access" className="space-y-6">
        <TabsList>
          <TabsTrigger value="access">PHI Access Logs</TabsTrigger>
          <TabsTrigger value="consents">Consent Management</TabsTrigger>
          <TabsTrigger value="retention">Data Retention</TabsTrigger>
        </TabsList>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                PHI Access Audit Trail
              </CardTitle>
              <CardDescription>Comprehensive logging of all PHI access events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phiLogs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={log.emergency_access ? 'destructive' : 'secondary'}>
                          {log.access_type}
                        </Badge>
                        {log.emergency_access && (
                          <Badge variant="destructive">EMERGENCY</Badge>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{log.resource_type}</span>
                        {log.access_reason && (
                          <span className="text-muted-foreground"> • {log.access_reason}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.accessed_at), 'MMM d, yyyy h:mm:ss a')}
                        {log.ip_address && ` • IP: ${log.ip_address}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Patient Consents
              </CardTitle>
              <CardDescription>Track and manage patient consent forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {consents.map((consent: any) => (
                <div key={consent.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={consent.consent_status === 'granted' ? 'default' : 'secondary'}>
                          {consent.consent_status}
                        </Badge>
                        <span className="font-medium">
                          {consent.patients?.first_name} {consent.patients?.last_name}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{consent.consent_type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Granted: {format(new Date(consent.consent_date), 'MMM d, yyyy')}
                        {consent.expiration_date && (
                          <> • Expires: {format(new Date(consent.expiration_date), 'MMM d, yyyy')}</>
                        )}
                      </div>
                      {consent.scope && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Scope: {consent.scope}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Retention Policies
              </CardTitle>
              <CardDescription>Automated data lifecycle management</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {retentionPolicies.map((policy: any) => (
                <div key={policy.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-1">{policy.data_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {policy.policy_description}
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-xs">
                        <div>
                          <span className="font-medium">Retain:</span> {policy.retention_period_days} days
                        </div>
                        {policy.archive_after_days && (
                          <div>
                            <span className="font-medium">Archive:</span> {policy.archive_after_days} days
                          </div>
                        )}
                        {policy.delete_after_days && (
                          <div>
                            <span className="font-medium">Delete:</span> {policy.delete_after_days} days
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={policy.active ? 'default' : 'secondary'}>
                      {policy.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}