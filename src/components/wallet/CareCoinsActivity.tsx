
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { useCareCoinsTransactions } from '@/hooks/useCareCoinsTransactions';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CareCoinsActivityProps {
  onViewAll?: () => void;
}

const CareCoinsActivity = ({ onViewAll }: CareCoinsActivityProps) => {
  const { transactions, isLoading, refreshTransactions } = useCareCoinsTransactions();
  const { user } = useAuth();

  // Show a message if there are no transactions
  if (!isLoading && transactions.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>CareCoins Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            No transactions yet. Start earning or sending CareCoins!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CareCoins Activity</CardTitle>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refreshTransactions}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            // Show skeletons while loading
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))
          ) : (
            // Render actual transactions
            transactions.map((transaction) => {
              const isIncoming = transaction.to_user_id === user?.id;
              const formattedDate = transaction.created_at 
                ? formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })
                : '';
              
              return (
                <div key={transaction.id} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center gap-1">
                      {transaction.description || 'CareCoins Transfer'}
                      {isIncoming ? (
                        <ArrowDownLeft className="h-3 w-3 text-green-500" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 text-orange-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      {isIncoming ? 'From' : 'To'}: {transaction.otherUserName}
                      <span className="h-1 w-1 rounded-full bg-muted-foreground inline-block mx-1"></span>
                      {formattedDate}
                    </div>
                  </div>
                  <Badge variant={isIncoming ? "outline" : "secondary"} className={
                    isIncoming 
                      ? "bg-green-50 text-green-700 border-green-200" 
                      : "bg-orange-50 text-orange-700 border-orange-200"
                  }>
                    {isIncoming ? '+' : '-'}{transaction.amount} coins
                  </Badge>
                </div>
              );
            })
          )}
          
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onViewAll}
          >
            View all transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CareCoinsActivity;
