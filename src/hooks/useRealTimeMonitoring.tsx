import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  performance_score: number;
  active_issues: number;
  last_optimization: string;
}

interface PerformanceMetric {
  metric_name: string;
  current_value: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'degrading';
}

export function useRealTimeMonitoring() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  const startMonitoring = useCallback(async () => {
    setIsMonitoring(true);
    
    // Simulate real-time monitoring
    const generateMetrics = () => {
      const newMetrics: PerformanceMetric[] = [
        {
          metric_name: 'Response Time',
          current_value: Math.random() * 100 + 50,
          threshold: 100,
          status: Math.random() > 0.8 ? 'warning' : 'good',
          trend: Math.random() > 0.5 ? 'improving' : 'stable'
        },
        {
          metric_name: 'CPU Usage',
          current_value: Math.random() * 40 + 20,
          threshold: 80,
          status: 'good',
          trend: 'stable'
        },
        {
          metric_name: 'Memory Usage',
          current_value: Math.random() * 30 + 40,
          threshold: 85,
          status: 'good',
          trend: 'improving'
        },
        {
          metric_name: 'Database Connections',
          current_value: Math.random() * 50 + 25,
          threshold: 100,
          status: 'good',
          trend: 'stable'
        },
        {
          metric_name: 'Error Rate',
          current_value: Math.random() * 2,
          threshold: 5,
          status: 'good',
          trend: 'improving'
        }
      ];

      setMetrics(newMetrics);

      // Update system health
      const avgPerformance = newMetrics.reduce((acc, m) => acc + (m.status === 'good' ? 100 : m.status === 'warning' ? 70 : 30), 0) / newMetrics.length;
      const issueCount = newMetrics.filter(m => m.status !== 'good').length;

      setSystemHealth({
        status: issueCount === 0 ? 'healthy' : issueCount <= 2 ? 'warning' : 'critical',
        uptime: 99.8 + Math.random() * 0.2,
        performance_score: avgPerformance,
        active_issues: issueCount,
        last_optimization: new Date().toISOString()
      });

      // Generate alerts for critical metrics
      const criticalMetrics = newMetrics.filter(m => m.status === 'critical');
      if (criticalMetrics.length > 0) {
        setAlerts(prev => [
          ...prev.slice(-4), // Keep last 4 alerts
          `Critical: ${criticalMetrics[0].metric_name} exceeded threshold`
        ]);
      }
    };

    generateMetrics();
    
    // Update metrics every 5 seconds
    const interval = setInterval(generateMetrics, 5000);
    
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, []);

  const triggerOptimization = useCallback(async () => {
    try {
      // Trigger AI optimization
      const { data, error } = await supabase.functions.invoke('ai-real-improvements');
      
      if (error) throw error;
      
      setAlerts(prev => [
        ...prev.slice(-4),
        `AI Optimization: ${data.improvement_implemented || 'System optimization initiated'}`
      ]);
      
      return { success: true, data };
    } catch (error) {
      console.error('Optimization failed:', error);
      setAlerts(prev => [
        ...prev.slice(-4),
        'Optimization failed: Please check system logs'
      ]);
      return { success: false, error };
    }
  }, []);

  const getHealthColor = useCallback((status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, []);

  const getMetricStatus = useCallback((metric: PerformanceMetric) => {
    if (metric.current_value > metric.threshold) {
      return 'critical';
    } else if (metric.current_value > metric.threshold * 0.8) {
      return 'warning';
    }
    return 'good';
  }, []);

  useEffect(() => {
    const cleanup = startMonitoring();
    return () => {
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [startMonitoring]);

  return {
    systemHealth,
    metrics,
    isMonitoring,
    alerts,
    triggerOptimization,
    getHealthColor,
    getMetricStatus,
    startMonitoring
  };
}