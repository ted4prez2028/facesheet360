import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CareCoinActivityMonitor = () => {
  // Monitor recent CareCoin minting activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-carecoin-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charting_profits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Count pending distributions
  const pendingCount = recentActivity?.filter(p => p.status === 'pending').length || 0;
  const completedCount = recentActivity?.filter(p => p.status === 'completed').length || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              CareCoin Activity Monitor
            </CardTitle>
            <CardDescription>
              Real-time tracking of token minting
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-yellow-600">
              {pendingCount} Pending
            </Badge>
            <Badge variant="outline" className="text-green-600">
              {completedCount} Completed
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {activity.chart_type.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      activity.status === 'completed'
                        ? 'default'
                        : activity.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {activity.status}
                  </Badge>
                  <span className="text-sm font-medium">{activity.total_amount} CARE</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};