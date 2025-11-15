import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Info, FileText, Search } from 'lucide-react';
import { DrugInteractionChecker } from '@/components/clinical/DrugInteractionChecker';

export default function ClinicalDecisionSupport() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch clinical alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['clinical-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinical_alerts')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch clinical guidelines
  const { data: guidelines = [] } = useQuery({
    queryKey: ['clinical-guidelines', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('clinical_guidelines')
        .select('*')
        .order('effective_date', { ascending: false });
      
      if (searchTerm) {
        query = query.or(`condition.ilike.%${searchTerm}%,guideline_title.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Info className="h-5 w-5 text-info" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-destructive',
      warning: 'bg-warning',
      info: 'bg-info'
    };
    return colors[severity as keyof typeof colors] || 'bg-secondary';
  };

  const getEvidenceBadge = (level: string) => {
    const colors = {
      A: 'bg-green-500',
      B: 'bg-blue-500',
      C: 'bg-yellow-500',
      D: 'bg-orange-500'
    };
    return colors[level as keyof typeof colors] || 'bg-secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clinical Decision Support</h1>
        <p className="text-muted-foreground">AI-powered clinical guidance and alerts</p>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="guidelines">Clinical Guidelines</TabsTrigger>
          <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Clinical Alerts</CardTitle>
              <CardDescription>Unresolved alerts requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <Alert key={alert.id} className={`border-l-4 ${getSeverityBadge(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1">
                          <div className="font-semibold">{alert.alert_message}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {alert.alert_type.replace('_', ' ')} • {new Date(alert.created_at).toLocaleString()}
                          </div>
                          {alert.triggered_by && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Triggered by: {alert.triggered_by}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </div>
                  </Alert>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence-Based Clinical Guidelines</CardTitle>
              <CardDescription>Search and review clinical practice guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by condition or guideline..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {guidelines.map((guideline) => (
                  <Card key={guideline.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{guideline.guideline_title}</CardTitle>
                          <CardDescription className="mt-1">
                            {guideline.condition}
                          </CardDescription>
                        </div>
                        {guideline.evidence_level && (
                          <Badge className={getEvidenceBadge(guideline.evidence_level)}>
                            Level {guideline.evidence_level}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {guideline.guideline_content}
                      </div>
                      {guideline.source && (
                        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          Source: {guideline.source}
                          {guideline.version && ` (v${guideline.version})`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {guidelines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="h-12 w-12 mx-auto mb-4" />
                    <p>No guidelines found. Try a different search term.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interactions">
          <DrugInteractionChecker />
        </TabsContent>
      </Tabs>
    </div>
  );
}