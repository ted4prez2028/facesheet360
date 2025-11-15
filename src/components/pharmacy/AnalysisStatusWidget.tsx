// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Clock, Mail, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export const AnalysisStatusWidget: React.FC = () => {
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLastAnalysis();
  }, []);

  const loadLastAnalysis = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pharmacy_analysis_history')
        .select('*')
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setLastAnalysis(data);
    } catch (error) {
      console.error('Error loading last analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysisNow = async () => {
    try {
      setIsRunning(true);
      toast.info('Starting pharmacy analysis...');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('generate-pharmacy-insights', {
        body: {}
      });

      if (error) throw error;

      if (data?.success) {
        // Store manual run in history
        await supabase.from('pharmacy_analysis_history').insert({
          total_insights: data.analyticsStored || 0,
          safety_alerts: data.insights?.safetyAlerts?.length || 0,
          refill_predictions: data.insights?.refillPredictions?.length || 0,
          adherence_issues: data.insights?.adherenceInsights?.length || 0,
          emails_sent: 0, // Manual runs don't send emails by default
          run_type: 'manual',
          triggered_by: user.id,
          insights_data: data.insights
        });

        toast.success(`Analysis complete! Generated ${data.analyticsStored} insights.`);
        loadLastAnalysis();
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Error running analysis:', error);
      
      // Handle specific error types
      if (error?.message?.includes('Rate limit') || error?.message?.includes('429')) {
        toast.error('OpenAI rate limit exceeded. Please wait a few minutes and try again.', {
          duration: 5000,
        });
      } else if (error?.message?.includes('OpenAI API key')) {
        toast.error('OpenAI API configuration issue. Please check your API key.', {
          duration: 5000,
        });
      } else {
        toast.error('Failed to run analysis. Please try again later.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Analysis Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastAnalysis ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Last Run
                </div>
                <p className="text-sm font-medium">
                  {formatDistanceToNow(new Date(lastAnalysis.analysis_date), { addSuffix: true })}
                </p>
                <Badge variant={lastAnalysis.run_type === 'automated' ? 'default' : 'secondary'} className="text-xs">
                  {lastAnalysis.run_type}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Alerts Sent
                </div>
                <p className="text-2xl font-bold">{lastAnalysis.emails_sent}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <AlertCircle className="h-3 w-3" />
                  Safety
                </div>
                <p className="text-lg font-bold text-destructive">{lastAnalysis.safety_alerts}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3" />
                  Refills
                </div>
                <p className="text-lg font-bold text-amber-600">{lastAnalysis.refill_predictions}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Brain className="h-3 w-3" />
                  Adherence
                </div>
                <p className="text-lg font-bold text-blue-600">{lastAnalysis.adherence_issues}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No analysis has been run yet</p>
          </div>
        )}

        <Button 
          onClick={runAnalysisNow} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Run Analysis Now
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Automated analysis runs daily at 6 AM
        </p>
      </CardContent>
    </Card>
  );
};

export default AnalysisStatusWidget;
