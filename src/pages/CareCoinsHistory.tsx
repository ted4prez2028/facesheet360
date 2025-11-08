import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCareCoinsTransactions } from '@/hooks/useCareCoinsTransactions';
import { ArrowDownRight, ArrowUpRight, Calendar, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function CareCoinsHistory() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const { transactions, isLoading } = useCareCoinsTransactions({
    userId: user?.id || '',
    category: category !== 'all' ? category : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
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
      ['Date', 'Type', 'Category', 'Amount', 'Description'],
      ...transactions.map(t => [
        format(new Date(t.created_at), 'yyyy-MM-dd HH:mm'),
        t.transaction_type,
        getCategoryLabel(t.transaction_type),
        t.amount,
        t.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carecoins-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getCategoryLabel = (type: string) => {
    const labels: Record<string, string> = {
      earned: 'Charting',
      spent: 'Rides',
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
            <p className="text-center text-muted-foreground">Please log in to view your transaction history.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CareCoin History</h1>
          <p className="text-muted-foreground">View all your CareCoin transactions</p>
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
                  <SelectItem value="spent">Rides</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                  <SelectItem value="reward">Rewards</SelectItem>
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

      {/* Transaction List */}
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
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
