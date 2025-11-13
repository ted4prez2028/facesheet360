import { CareCoinsAnalyticsDashboard } from '@/components/dashboard/CareCoinsAnalyticsDashboard';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Loader2 } from 'lucide-react';

export default function CareCoinsAnalytics() {
  const { isAdmin, isLoading } = useAdminStatus();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Admin Access Required</h2>
              <p className="text-muted-foreground">
                You need administrator privileges to view CareCoin analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CareCoinsAnalyticsDashboard />;
}
