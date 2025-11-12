import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CashOutRequest {
  id: string;
  user_id: string;
  amount: number;
  usd_amount: number;
  exchange_rate: number;
  payment_method: string;
  account_info: any;
  status: string;
  failure_reason?: string | null;
  requested_at: string;
  processed_at?: string | null;
  completed_at?: string | null;
  profiles?: {
    name: string;
    email: string;
  } | null;
}

export default function AdminCashOutRequests() {
  const { isAdmin, isLoading: adminLoading } = useAdminStatus();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<CashOutRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | null>(null);
  const [reason, setReason] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-cashout-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cashout_requests')
        .select('*, profiles(name, email)')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as unknown as CashOutRequest[];
    },
    enabled: isAdmin,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
      failureReason,
    }: {
      requestId: string;
      status: string;
      failureReason?: string;
    }) => {
      const updateData: any = {
        status,
        processed_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (failureReason) {
        updateData.failure_reason = failureReason;
      }

      const { error: updateError } = await supabase
        .from('cashout_requests')
        .update(updateData)
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Send email notification
      const request = requests?.find((r) => r.id === requestId);
      if (request) {
        await supabase.functions.invoke('send-cashout-notification', {
          body: {
            email: request.profiles?.email,
            name: request.profiles?.name,
            amount: request.amount,
            usdAmount: request.usd_amount,
            paymentMethod: request.payment_method,
            status,
            failureReason,
          },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cashout-requests'] });
      toast.success('Cash-out request updated successfully');
      setSelectedRequest(null);
      setActionType(null);
      setReason('');
    },
    onError: (error) => {
      toast.error(`Failed to update request: ${error.message}`);
    },
  });

  if (adminLoading) {
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
                You need administrator privileges to view cash-out requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      completed: { variant: 'default', label: 'Completed' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      cancelled: { variant: 'outline', label: 'Cancelled' },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns: any[] = [
    {
      key: 'requested_at' as keyof CashOutRequest,
      header: 'Date',
      sortable: true,
      render: (request: CashOutRequest) => new Date(request.requested_at).toLocaleDateString(),
    },
    {
      key: 'user_id' as keyof CashOutRequest,
      header: 'User',
      render: (request: CashOutRequest) => (
        <div>
          <div className="font-medium">{request.profiles?.name || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">{request.profiles?.email || ''}</div>
        </div>
      ),
    },
    {
      key: 'amount' as keyof CashOutRequest,
      header: 'CareCoins',
      sortable: true,
      render: (request: CashOutRequest) => request.amount.toLocaleString(),
    },
    {
      key: 'usd_amount' as keyof CashOutRequest,
      header: 'USD Amount',
      sortable: true,
      render: (request: CashOutRequest) => `$${request.usd_amount.toFixed(2)}`,
    },
    {
      key: 'payment_method' as keyof CashOutRequest,
      header: 'Payment Method',
      render: (request: CashOutRequest) => (
        <div>
          <div className="capitalize">{request.payment_method.replace('_', ' ')}</div>
          <div className="text-xs text-muted-foreground">
            {request.account_info && typeof request.account_info === 'object' 
              ? Object.entries(request.account_info)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ')
              : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'status' as keyof CashOutRequest,
      header: 'Status',
      sortable: true,
      render: (request: CashOutRequest) => getStatusBadge(request.status),
    },
    {
      key: 'id' as keyof CashOutRequest,
      header: 'Actions',
      render: (request: CashOutRequest) => (
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="default"
                onClick={() => {
                  setSelectedRequest(request);
                  setActionType('approve');
                }}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedRequest(request);
                  setActionType('reject');
                }}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
          {request.status === 'approved' && (
            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setSelectedRequest(request);
                setActionType('complete');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Cash-Out Requests</h1>
        <p className="text-muted-foreground">Review and manage CareCoin redemption requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={requests || []}
            columns={columns}
            isLoading={isLoading}
            searchable
            exportable
          />
        </CardContent>
      </Card>

      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Cash-Out Request'}
              {actionType === 'reject' && 'Reject Cash-Out Request'}
              {actionType === 'complete' && 'Complete Cash-Out Request'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' &&
                'Approve this cash-out request. The user will be notified via email.'}
              {actionType === 'reject' &&
                'Reject this cash-out request. Please provide a reason for rejection.'}
              {actionType === 'complete' &&
                'Mark this request as completed. The user will receive a confirmation email.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User:</span>
                  <span className="font-medium">{selectedRequest.profiles?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    {selectedRequest.amount} CareCoins (${selectedRequest.usd_amount.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {selectedRequest.payment_method.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Rejection</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for rejecting this request..."
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedRequest) return;
                if (actionType === 'reject' && !reason.trim()) {
                  toast.error('Please provide a reason for rejection');
                  return;
                }

                const statusMap = {
                  approve: 'approved',
                  reject: 'rejected',
                  complete: 'completed',
                };

                updateStatusMutation.mutate({
                  requestId: selectedRequest.id,
                  status: statusMap[actionType!],
                  failureReason: actionType === 'reject' ? reason : undefined,
                });
              }}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'complete' && 'Mark as Complete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
