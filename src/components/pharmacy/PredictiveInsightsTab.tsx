import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertCircle, Calendar, FileText, Brain } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

export const PredictiveInsightsTab: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [projections, setProjections] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      // Load existing analytics
      const { data, error } = await supabase
        .from('pharmacy_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Group by medication and type
      const grouped: any = {};
      data?.forEach(item => {
        const key = `${item.medication_name}-${item.metric_type}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
      });

      setInsights(data || []);
      generateProjections(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Failed to load insights');
    }
  };

  const generateProjections = (analyticsData: any[]) => {
    // Calculate refill projections based on usage patterns
    const medicationUsage: any = {};

    analyticsData
      .filter(d => d.metric_type === 'daily_usage')
      .forEach(item => {
        if (!medicationUsage[item.medication_name]) {
          medicationUsage[item.medication_name] = [];
        }
        medicationUsage[item.medication_name].push(item.metric_value);
      });

    const newProjections: any[] = [];
    Object.keys(medicationUsage).forEach(medName => {
      const usageData = medicationUsage[medName];
      if (usageData.length === 0) return;

      // Calculate average daily usage
      const avgDailyUsage = usageData.reduce((a: number, b: number) => a + b, 0) / usageData.length;

      // Project when to reorder (30 day supply threshold)
      const daysUntilReorder = Math.ceil(30 / avgDailyUsage);

      newProjections.push({
        medication: medName,
        avgDailyUsage: avgDailyUsage.toFixed(2),
        projectedRefillDate: addDays(new Date(), daysUntilReorder),
        daysUntilRefill: daysUntilReorder,
        confidence: Math.min(0.95, usageData.length / 30) // Higher confidence with more data points
      });
    });

    setProjections(newProjections.sort((a, b) => a.daysUntilRefill - b.daysUntilRefill));
  };

  const generateAIInsights = async () => {
    try {
      setIsGenerating(true);

      // In a real implementation, this would call an AI service
      // For now, we'll generate sample insights based on current data

      // Load recent MAR data to analyze adherence
      const { data: marData, error: marError } = await supabase
        .from('medication_administration_records')
        .select('*')
        .gte('administered_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (marError) throw marError;

      // Calculate adherence rates
      const medicationAdherence: any = {};
      marData?.forEach(record => {
        if (!medicationAdherence[record.medication_name]) {
          medicationAdherence[record.medication_name] = { given: 0, total: 0 };
        }
        medicationAdherence[record.medication_name].total++;
        if (record.status === 'given') {
          medicationAdherence[record.medication_name].given++;
        }
      });

      // Store new analytics
      const newAnalytics: any[] = [];
      Object.keys(medicationAdherence).forEach(medName => {
        const data = medicationAdherence[medName];
        const adherenceRate = (data.given / data.total) * 100;

        newAnalytics.push({
          medication_name: medName,
          metric_type: 'adherence_rate',
          metric_value: adherenceRate,
          confidence_score: Math.min(0.95, data.total / 90), // More data = higher confidence
          metadata: {
            total_doses: data.total,
            given_doses: data.given,
            analysis_period: '30_days'
          }
        });
      });

      if (newAnalytics.length > 0) {
        const { error: insertError } = await supabase
          .from('pharmacy_analytics')
          .insert(newAnalytics);

        if (insertError) throw insertError;
      }

      toast.success('AI insights generated');
      loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const adherenceInsights = insights.filter(i => i.metric_type === 'adherence_rate');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Predictive Analytics & Insights</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered medication management and forecasting
          </p>
        </div>
        <Button onClick={generateAIInsights} disabled={isGenerating}>
          <Brain className="h-4 w-4 mr-2" />
          {isGenerating ? 'Analyzing...' : 'Generate AI Insights'}
        </Button>
      </div>

      {/* Refill Projections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Refill Projections (Next 60 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {projections.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No projections available. Generate insights to see predictions.
            </p>
          ) : (
            <div className="space-y-3">
              {projections.slice(0, 10).map((proj, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{proj.medication}</p>
                    <p className="text-sm text-muted-foreground">
                      Avg usage: {proj.avgDailyUsage} per day
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={proj.daysUntilRefill < 7 ? 'destructive' : 'secondary'}>
                      {proj.daysUntilRefill} days
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(proj.projectedRefillDate, 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(proj.confidence * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Adherence Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Medication Adherence Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          {adherenceInsights.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No adherence data available yet
            </p>
          ) : (
            <div className="space-y-3">
              {adherenceInsights.map((insight, idx) => {
                const rate = insight.metric_value;
                const isLow = rate < 80;
                return (
                  <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      {isLow && <AlertCircle className="h-5 w-5 text-amber-600" />}
                      <div>
                        <p className="font-medium">{insight.medication_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {insight.metadata?.given_doses || 0} of {insight.metadata?.total_doses || 0} doses given
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={isLow ? 'destructive' : 'default'} className="text-lg px-3">
                        {rate.toFixed(1)}%
                      </Badge>
                      {isLow && (
                        <p className="text-xs text-amber-600 mt-1">
                          Needs attention
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {projections.filter(p => p.daysUntilRefill < 14).length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Urgent Refills Needed
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  {projections
                    .filter(p => p.daysUntilRefill < 14)
                    .map((proj, idx) => (
                      <li key={idx}>
                        • Contact prescriber for {proj.medication} refill (due in {proj.daysUntilRefill} days)
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {adherenceInsights.filter(i => i.metric_value < 80).length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Adherence Improvement Opportunities
                </h4>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  {adherenceInsights
                    .filter(i => i.metric_value < 80)
                    .map((insight, idx) => (
                      <li key={idx}>
                        • Review {insight.medication_name} administration schedule with care team
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {projections.length === 0 && adherenceInsights.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Click "Generate AI Insights" to see recommendations
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveInsightsTab;
