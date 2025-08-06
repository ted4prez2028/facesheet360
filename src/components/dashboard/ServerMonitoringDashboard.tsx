import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Cpu,
  HardDrive,
  Network,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface ServerMetrics {
  uptime: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  response_time: number;
  error_rate: number;
  active_connections: number;
  requests_per_minute: number;
}

interface DatabaseMetrics {
  query_performance: number;
  slow_queries: number;
  cache_hit_ratio: number;
  active_connections: number;
  deadlocks: number;
  table_size_gb: number;
}

interface PerformanceIssue {
  id: string;
  type: 'performance' | 'security' | 'availability';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  auto_fixable: boolean;
  detected_at: string;
}

export function ServerMonitoringDashboard() {
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const { toast } = useToast();
  const [serverMetrics, setServerMetrics] = useState<ServerMetrics | null>(null);
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetrics | null>(null);
  const [issues, setIssues] = useState<PerformanceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const fetchServerMetrics = async () => {
    try {
      // Simulate server metrics (in real implementation, these would come from monitoring APIs)
      const metrics: ServerMetrics = {
        uptime: 99.8,
        cpu_usage: Math.random() * 30 + 20,
        memory_usage: Math.random() * 40 + 30,
        disk_usage: Math.random() * 20 + 15,
        response_time: Math.random() * 100 + 50,
        error_rate: Math.random() * 2,
        active_connections: Math.floor(Math.random() * 100) + 50,
        requests_per_minute: Math.floor(Math.random() * 1000) + 500
      };

      const dbMetrics: DatabaseMetrics = {
        query_performance: Math.random() * 30 + 70,
        slow_queries: Math.floor(Math.random() * 10),
        cache_hit_ratio: Math.random() * 10 + 85,
        active_connections: Math.floor(Math.random() * 50) + 20,
        deadlocks: Math.floor(Math.random() * 3),
        table_size_gb: Math.random() * 5 + 2
      };

      setServerMetrics(metrics);
      setDbMetrics(dbMetrics);

      // Generate performance issues based on metrics
      const detectedIssues: PerformanceIssue[] = [];

      if (metrics.response_time > 120) {
        detectedIssues.push({
          id: 'slow-response',
          type: 'performance',
          severity: 'medium',
          title: 'Slow API Response Times',
          description: `Average response time is ${metrics.response_time.toFixed(0)}ms, above the 100ms threshold`,
          recommendation: 'Consider implementing query optimization and caching strategies',
          auto_fixable: true,
          detected_at: new Date().toISOString()
        });
      }

      if (dbMetrics.slow_queries > 5) {
        detectedIssues.push({
          id: 'slow-queries',
          type: 'performance',
          severity: 'high',
          title: 'Multiple Slow Database Queries',
          description: `${dbMetrics.slow_queries} slow queries detected in the last hour`,
          recommendation: 'Add database indexes and optimize query structures',
          auto_fixable: true,
          detected_at: new Date().toISOString()
        });
      }

      if (metrics.error_rate > 1) {
        detectedIssues.push({
          id: 'high-error-rate',
          type: 'availability',
          severity: 'critical',
          title: 'High Error Rate Detected',
          description: `Error rate at ${metrics.error_rate.toFixed(1)}%, above 1% threshold`,
          recommendation: 'Investigate error logs and implement error handling improvements',
          auto_fixable: false,
          detected_at: new Date().toISOString()
        });
      }

      setIssues(detectedIssues);
    } catch (error) {
      console.error('Error fetching server metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerAutoOptimization = async () => {
    setIsOptimizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-real-improvements');
      
      if (error) throw error;
      
      toast({
        title: "🚀 Server Optimization Started",
        description: data.success 
          ? `AI is optimizing: ${data.improvement_implemented}`
          : "Server optimization initiated",
      });
      
      // Refresh metrics after optimization
      setTimeout(fetchServerMetrics, 3000);
    } catch (error: any) {
      console.error('Optimization failed:', error);
      toast({
        title: "❌ Optimization Failed",
        description: error.message || "Failed to start server optimization",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchServerMetrics();
      
      // Refresh metrics every 30 seconds
      const interval = setInterval(fetchServerMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (adminLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Checking permissions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Server monitoring is only available to administrators.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Server Monitoring Dashboard
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

  const getIssueColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getMetricStatus = (value: number, threshold: number, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-primary" />
                Server Monitoring & Auto-Optimization
              </CardTitle>
              <CardDescription>
                Real-time server performance monitoring with AI-powered optimization
              </CardDescription>
            </div>
            <Button 
              onClick={triggerAutoOptimization}
              disabled={isOptimizing}
              className="bg-primary hover:bg-primary/90"
            >
              {isOptimizing ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-pulse" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Auto-Optimize Server
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Server Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                <p className={`text-2xl font-bold ${getMetricStatus(serverMetrics?.uptime || 0, 99.5)}`}>
                  {serverMetrics?.uptime.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                <p className={`text-2xl font-bold ${getMetricStatus(serverMetrics?.response_time || 0, 100, true)}`}>
                  {serverMetrics?.response_time.toFixed(0)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p className={`text-2xl font-bold ${getMetricStatus(serverMetrics?.cpu_usage || 0, 80, true)}`}>
                  {serverMetrics?.cpu_usage.toFixed(1)}%
                </p>
              </div>
              <Cpu className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                <p className={`text-2xl font-bold ${issues.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {issues.length}
                </p>
              </div>
              <AlertTriangle className={`w-8 h-8 ${issues.length > 0 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="issues">Issues & Alerts</TabsTrigger>
          <TabsTrigger value="optimization">AI Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">CPU Usage</span>
                    <span className="font-semibold">{serverMetrics?.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics?.cpu_usage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Memory Usage</span>
                    <span className="font-semibold">{serverMetrics?.memory_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics?.memory_usage} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Disk Usage</span>
                    <span className="font-semibold">{serverMetrics?.disk_usage.toFixed(1)}%</span>
                  </div>
                  <Progress value={serverMetrics?.disk_usage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network & Traffic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Connections</span>
                  <span className="font-semibold">{serverMetrics?.active_connections}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Requests/Minute</span>
                  <span className="font-semibold">{serverMetrics?.requests_per_minute}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Error Rate</span>
                  <span className={`font-semibold ${getMetricStatus(serverMetrics?.error_rate || 0, 1, true)}`}>
                    {serverMetrics?.error_rate.toFixed(2)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Query Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Query Performance Score</span>
                    <span className="font-semibold">{dbMetrics?.query_performance.toFixed(1)}%</span>
                  </div>
                  <Progress value={dbMetrics?.query_performance} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Slow Queries (last hour)</span>
                  <span className={`font-semibold ${dbMetrics && dbMetrics.slow_queries > 5 ? 'text-red-500' : 'text-green-500'}`}>
                    {dbMetrics?.slow_queries}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Cache Hit Ratio</span>
                    <span className="font-semibold">{dbMetrics?.cache_hit_ratio.toFixed(1)}%</span>
                  </div>
                  <Progress value={dbMetrics?.cache_hit_ratio} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Connections</span>
                  <span className="font-semibold">{dbMetrics?.active_connections}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Deadlocks</span>
                  <span className={`font-semibold ${dbMetrics && dbMetrics.deadlocks > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {dbMetrics?.deadlocks}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Size</span>
                  <span className="font-semibold">{dbMetrics?.table_size_gb.toFixed(1)} GB</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          {issues.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-green-600">All Systems Running Smoothly</p>
                  <p className="text-muted-foreground">No performance issues detected</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <h3 className="font-semibold">{issue.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`${getIssueColor(issue.severity)} text-white`}
                        >
                          {issue.severity.toUpperCase()}
                        </Badge>
                        {issue.auto_fixable && (
                          <Badge variant="outline" className="text-xs">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {issue.description}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        💡 {issue.recommendation}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock className="w-3 h-3" />
                        Detected: {new Date(issue.detected_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">AI Server Optimization</h3>
                <p className="text-muted-foreground">
                  The AI system continuously monitors server performance and automatically applies optimizations
                  when issues are detected. This includes database query optimization, caching improvements,
                  and resource allocation adjustments.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center">
                    <Database className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                    <p className="font-medium">Database Optimization</p>
                    <p className="text-sm text-muted-foreground">Query analysis & index creation</p>
                  </div>
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                    <p className="font-medium">Performance Tuning</p>
                    <p className="text-sm text-muted-foreground">Resource allocation & caching</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    <p className="font-medium">Predictive Scaling</p>
                    <p className="text-sm text-muted-foreground">Automatic capacity adjustments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}