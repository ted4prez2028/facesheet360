import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, TrendingUp, Bed, Activity, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PredictiveAnalytics() {
  // Fetch patient risk scores
  const { data: riskScores = [] } = useQuery({
    queryKey: ['patient-risk-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_risk_scores')
        .select('*, patients(*)')
        .order('risk_score', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Fetch capacity metrics
  const { data: capacityData = [] } = useQuery({
    queryKey: ['capacity-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('capacity_metrics')
        .select('*')
        .gte('metric_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: true })
        .order('metric_hour', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const highRiskPatients = riskScores.filter((s: any) => s.risk_level === 'high' || s.risk_level === 'critical');
  const avgOccupancy = capacityData.length > 0
    ? (capacityData.reduce((sum: number, m: any) => sum + (m.occupied_beds / m.total_beds) * 100, 0) / capacityData.length).toFixed(1)
    : '0';

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Predictive Analytics</h1>
        <p className="text-muted-foreground">AI-powered insights and forecasting</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              High Risk Patients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{highRiskPatients.length}</div>
            <p className="text-xs text-muted-foreground">Requiring intervention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bed className="h-4 w-4" />
              Avg Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgOccupancy}%</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Risk Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{riskScores.length}</div>
            <p className="text-xs text-muted-foreground">Active scores</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="risk" className="space-y-6">
        <TabsList>
          <TabsTrigger value="risk">Risk Scores</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Forecast</TabsTrigger>
          <TabsTrigger value="readmission">Readmission Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Patient Risk Scores
              </CardTitle>
              <CardDescription>ML-powered risk stratification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {riskScores.map((score: any) => (
                <div key={score.id} className="border rounded-lg p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getRiskColor(score.risk_level)}>
                        {score.risk_level}
                      </Badge>
                      <span className="font-medium">
                        {score.patients?.first_name} {score.patients?.last_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Risk Type: {score.risk_type.replace('_', ' ')} • Score: {score.risk_score}%
                    </div>
                    {score.contributing_factors && (
                      <div className="mt-2 text-xs">
                        <span className="font-medium">Factors: </span>
                        <span className="text-muted-foreground">
                          {Object.keys(score.contributing_factors).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{score.risk_score}%</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(score.calculated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5" />
                Hospital Capacity Forecast
              </CardTitle>
              <CardDescription>Real-time bed management and forecasting</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={capacityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="metric_date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="occupied_beds" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Occupied Beds"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="available_beds" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Available Beds"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecasted_admissions" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Forecasted Admissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="readmission">
          <Card>
            <CardHeader>
              <CardTitle>Readmission Risk Analysis</CardTitle>
              <CardDescription>Identify patients at high risk of readmission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Readmission Risk Model</p>
                <p className="text-sm mt-2">AI model training in progress</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}