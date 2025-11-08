import { CareCoinsAnalyticsDashboard } from '@/components/dashboard/CareCoinsAnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function CareCoinsAnalytics() {
  const { user } = useAuth();

  // Check if user is admin - need to query user_roles table
  const isAdmin = false; // Placeholder - implement proper admin check with user_roles table

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
