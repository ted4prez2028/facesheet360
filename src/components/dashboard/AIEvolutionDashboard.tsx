import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Code, TrendingUp, Zap, Clock, FileText, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AICodeGenerationDashboard } from './AICodeGenerationDashboard';

interface AIImprovement {
  id: string;
  improvement_type: string;
  title: string;
  description: string;
  implementation_status: string;
  impact_score: number;
  completion_time: string;
  created_at: string;
}

interface EvolutionMetrics {
  metric_date: string;
  total_improvements: number;
  ui_improvements: number;
  performance_improvements: number;
  feature_additions: number;
  bug_fixes: number;
  accessibility_improvements: number;
  lines_of_code_added: number;
  files_modified: number;
  avg_impact_score: number;
}

const AIEvolutionDashboard: React.FC = () => {
  const { toast } = useToast();
  const [improvements, setImprovements] = useState<AIImprovement[]>([]);
  const [metrics, setMetrics] = useState<EvolutionMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringAI, setTriggeringAI] = useState(false);

  const fetchData = async () => {
    try {
      const [improvementsResponse, metricsResponse] = await Promise.all([
        supabase
          .from('ai_improvements')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('app_evolution_metrics')
          .select('*')
          .order('metric_date', { ascending: false })
          .limit(30)
      ]);

      if (improvementsResponse.data) setImprovements(improvementsResponse.data);
      if (metricsResponse.data) setMetrics(metricsResponse.data);
    } catch (error) {
      console.error('Error fetching AI evolution data:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAIImprovement = async () => {
    setTriggeringAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-self-improvement');
      
      // Handle the response - now all responses come back as 200 status
      if (data && !data.success) {
        // Handle error responses that come back as 200 but with success: false
        toast({
          title: "⏳ AI System Status",
          description: data.error.includes('rate limit') || data.error.includes('429')
            ? "AI improvements are temporarily paused due to API limits. Will resume automatically."
            : data.error,
          variant: data.error.includes('rate limit') ? "default" : "destructive",
        });
      } else if (error) {
        throw error;
      } else {
        toast({
          title: "🤖 AI Improvement Triggered",
          description: `${data?.improvement_implemented || 'System analyzed and improved'}`,
        });
      }

      // Refresh data after a short delay
      setTimeout(fetchData, 2000);
    } catch (error) {
      console.error('Error triggering AI improvement:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI system. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setTriggeringAI(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up real-time subscriptions
    const improvementsSubscription = supabase
      .channel('ai_improvements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_improvements' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(improvementsSubscription);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ui_enhancement': return <Zap className="w-4 h-4" />;
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'feature': return <Code className="w-4 h-4" />;
      case 'bug_fix': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const totalImprovements = metrics[0]?.total_improvements || 0;
  const recentMetrics = metrics.slice(0, 7);
  const avgImpactScore = metrics[0]?.avg_impact_score || 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Self-Evolution Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Self-Evolution Dashboard
              </CardTitle>
              <CardDescription>
                Autonomous AI continuously improving FaceSheet360
              </CardDescription>
            </div>
            <Button 
              onClick={triggerAIImprovement}
              disabled={triggeringAI}
              className="bg-primary hover:bg-primary/90"
            >
              {triggeringAI ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Trigger AI Improvement
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Improvements</p>
                <p className="text-2xl font-bold">{totalImprovements}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Impact Score</p>
                <p className="text-2xl font-bold">{avgImpactScore.toFixed(1)}/10</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Files Modified</p>
                <p className="text-2xl font-bold">{metrics[0]?.files_modified || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code Added</p>
                <p className="text-2xl font-bold">{metrics[0]?.lines_of_code_added || 0}</p>
              </div>
              <Code className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="code-gen">Code Generation</TabsTrigger>
          <TabsTrigger value="improvements">Recent Improvements</TabsTrigger>
          <TabsTrigger value="metrics">Evolution Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">AI Evolution System Status</h3>
                <p className="text-muted-foreground">
                  The AI system continuously analyzes and improves FaceSheet360 with real code generation and deployment capabilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <Brain className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="font-medium">AI Analysis</p>
                    <p className="text-sm text-muted-foreground">Continuous system monitoring</p>
                  </div>
                  <div className="text-center">
                    <Code className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="font-medium">Code Generation</p>
                    <p className="text-sm text-muted-foreground">Automated React/TypeScript improvements</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                    <p className="font-medium">Auto Deployment</p>
                    <p className="text-sm text-muted-foreground">GitHub integration & pull requests</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code-gen" className="space-y-4">
          <AICodeGenerationDashboard onImprovementTriggered={fetchData} />
        </TabsContent>

        <TabsContent value="improvements" className="space-y-4">
          {improvements.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No AI improvements yet. The system is analyzing...
                </p>
              </CardContent>
            </Card>
          ) : (
            improvements.map((improvement) => (
              <Card key={improvement.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(improvement.improvement_type)}
                        <h3 className="font-semibold">{improvement.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          Impact: {improvement.impact_score}/10
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {improvement.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(improvement.created_at).toLocaleDateString()}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(improvement.implementation_status)} text-white`}
                        >
                          {improvement.implementation_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Improvement Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">UI Enhancements</span>
                    <span className="font-semibold">{metrics[0]?.ui_improvements || 0}</span>
                  </div>
                  <Progress value={(metrics[0]?.ui_improvements || 0) * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Performance</span>
                    <span className="font-semibold">{metrics[0]?.performance_improvements || 0}</span>
                  </div>
                  <Progress value={(metrics[0]?.performance_improvements || 0) * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Features</span>
                    <span className="font-semibold">{metrics[0]?.feature_additions || 0}</span>
                  </div>
                  <Progress value={(metrics[0]?.feature_additions || 0) * 10} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bug Fixes</span>
                    <span className="font-semibold">{metrics[0]?.bug_fixes || 0}</span>
                  </div>
                  <Progress value={(metrics[0]?.bug_fixes || 0) * 10} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Evolution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentMetrics.map((metric, index) => (
                    <div key={metric.metric_date} className="flex justify-between items-center">
                      <span className="text-sm">
                        {new Date(metric.metric_date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{metric.total_improvements}</span>
                        <div className="w-20">
                          <Progress value={metric.total_improvements * 20} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIEvolutionDashboard;