import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface CashOutRequest {
  id: string;
  amount: number;
  usd_amount: number;
  exchange_rate: number;
  payment_method: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  completed_at?: string;
  failure_reason?: string;
}

export const CashOutHistory = () => {
  const { user } = useAuth();

  const { data: cashoutRequests, isLoading } = useQuery({
    queryKey: ['cashout-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('cashout_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching cashout requests:', error);
        throw error;
      }

      return data as CashOutRequest[];
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      processing: { variant: 'default' as const, icon: Loader2, label: 'Processing' },
      completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed' },
      failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed' },
      cancelled: { variant: 'outline' as const, icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: 'Bank Transfer',
      paypal: 'PayPal',
      venmo: 'Venmo',
      amazon_gift_card: 'Amazon Gift Card',
      visa_gift_card: 'Visa Gift Card',
      mastercard_gift_card: 'Mastercard Gift Card',
    };
    return labels[method] || method;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!cashoutRequests || cashoutRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Out History</CardTitle>
          <CardDescription>View your past cash out requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No cash out requests yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your cash out history will appear here once you make a request
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Out History</CardTitle>
        <CardDescription>View your past cash out requests</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cashoutRequests.map((request) => (
            <div
              key={request.id}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {request.amount} CareCoins
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-semibold text-green-600">
                      ${request.usd_amount.toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getPaymentMethodLabel(request.payment_method)}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Requested:</span>
                  <p className="font-medium">
                    {format(new Date(request.requested_at), 'MMM dd, yyyy')}
                  </p>
                </div>
                {request.completed_at && (
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <p className="font-medium">
                      {format(new Date(request.completed_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                )}
              </div>

              {request.failure_reason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                  <p className="text-sm text-destructive">
                    <strong>Failure Reason:</strong> {request.failure_reason}
                  </p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="bg-muted rounded p-2">
                  <p className="text-xs text-muted-foreground">
                    Processing time: 3-5 business days
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};