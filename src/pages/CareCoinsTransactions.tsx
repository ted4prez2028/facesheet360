import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowDownRight, ArrowUpRight, Calendar, Filter, Download, ExternalLink, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CareCoinsTransactions() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch transactions with blockchain data
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['carecoin-transactions-detailed', user?.id, category, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('care_coins_transactions')
        .select(`
          *,
          from_profile:profiles!care_coins_transactions_from_user_id_fkey(name, email, wallet_address),
          to_profile:profiles!care_coins_transactions_to_user_id_fkey(name, email, wallet_address)
        `)
        .or(`user_id.eq.${user.id},from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('transaction_type', category);
      }
      if (startDate) {
        query = query.gte('created_at', new Date(startDate).toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', new Date(endDate + 'T23:59:59').toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch charting profits for blockchain data
  const { data: chartingProfits } = useQuery({
    queryKey: ['charting-profits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('charting_profits')
        .select(`
          *,
          patient:patients(name, user_id),
          provider:profiles!charting_profits_provider_id_fkey(name, email, wallet_address)
        `)
        .or(`provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getTotalEarned = () => {
    return transactions
      ?.filter(t => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  };

  const getTotalSpent = () => {
    return Math.abs(
      transactions
        ?.filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0
    );
  };

  const exportToCSV = () => {
    if (!transactions?.length) return;
    
    const csv = [
      ['Date', 'Type', 'Amount', 'Description', 'From Wallet', 'To Wallet', 'Blockchain TX'],
      ...transactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.transaction_type,
        t.amount,
        t.description || '',
        (t.from_profile as any)?.wallet_address || 'N/A',
        (t.to_profile as any)?.wallet_address || 'N/A',
        'View on Etherscan'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carecoins-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      earned: 'Charting',
      spent: 'Services',
      transfer: 'Transfer',
      reward: 'Reward',
      platform_fee: 'Platform Fee'
    };
    return labels[type] || type;
  };

  const getTransactionIcon = (amount: number) => {
    return amount > 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-500" />
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please log in to view transactions.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CareCoin Transactions</h1>
          <p className="text-muted-foreground">Complete transaction history with blockchain verification</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Earned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{getTotalEarned().toLocaleString()} CC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{getTotalSpent().toLocaleString()} CC
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {user.care_coins_balance?.toLocaleString() || 0} CC
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="earned">Charting</SelectItem>
                  <SelectItem value="spent">Services</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="reward">Rewards</SelectItem>
                  <SelectItem value="platform_fee">Platform Fees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Mints</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {transactions?.length || 0} transactions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No transactions found</div>
              ) : (
                <div className="space-y-3">
                  {transactions?.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                            {getTransactionIcon(Number(transaction.amount))}
                          </div>
                          <div>
                            <div className="font-medium">{transaction.description}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                              <Badge variant="outline" className="ml-2">
                                {getCategoryLabel(transaction.transaction_type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            Number(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {Number(transaction.amount) > 0 ? '+' : ''}
                          {Number(transaction.amount).toLocaleString()} CC
                        </div>
                      </div>

                      {/* Wallet addresses */}
                      <div className="grid gap-2 md:grid-cols-2 text-sm">
                        {(transaction.from_profile as any)?.wallet_address && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Wallet className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">From:</span>
                            <span className="font-mono text-xs">
                              {(transaction.from_profile as any).wallet_address.slice(0, 6)}...
                              {(transaction.from_profile as any).wallet_address.slice(-4)}
                            </span>
                          </div>
                        )}
                        {(transaction.to_profile as any)?.wallet_address && (
                          <div className="flex items-center gap-2 p-2 bg-muted rounded">
                            <Wallet className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">To:</span>
                            <span className="font-mono text-xs">
                              {(transaction.to_profile as any).wallet_address.slice(0, 6)}...
                              {(transaction.to_profile as any).wallet_address.slice(-4)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Minting Events</CardTitle>
              <CardDescription>
                CareCoins minted and sent to MetaMask wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartingProfits?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No minting events found</div>
              ) : (
                <div className="space-y-3">
                  {chartingProfits?.map((profit) => (
                    <div
                      key={profit.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Charting: {profit.chart_type}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(profit.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                          {profit.total_amount} CC Minted
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-3 text-sm">
                        <div className="p-3 border rounded bg-green-50 dark:bg-green-950">
                          <div className="text-muted-foreground mb-1">Patient (40%)</div>
                          <div className="font-bold text-green-600">{profit.patient_share} CC</div>
                        </div>
                        <div className="p-3 border rounded bg-blue-50 dark:bg-blue-950">
                          <div className="text-muted-foreground mb-1">Provider (50%)</div>
                          <div className="font-bold text-blue-600">{profit.provider_share} CC</div>
                          {(profit.provider as any)?.wallet_address && (
                            <div className="font-mono text-xs mt-1">
                              {(profit.provider as any).wallet_address.slice(0, 6)}...
                              {(profit.provider as any).wallet_address.slice(-4)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 border rounded bg-purple-50 dark:bg-purple-950">
                          <div className="text-muted-foreground mb-1">Admin (10%)</div>
                          <div className="font-bold text-purple-600">{profit.admin_share} CC</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
