// Updated imports with proper property names
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CareCoin, Coins, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useCareCoinsTransactions } from '@/hooks/useCareCoinsTransactions';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { CareCoinsTransaction } from '@/types';

interface CareCoinsActivityProps {
  onViewAll?: () => void;
}

export const CareCoinsActivity: React.FC<CareCoinsActivityProps> = ({ onViewAll }) => {
  const { user } = useAuth();
  const { transactions, isLoading } = useCareCoinsTransactions();
  
  // Correct the property name to careCoinsBalance instead of care_coins_balance
  const balance = user?.careCoinsBalance || 0;

  const TransactionItem: React.FC<{ transaction: CareCoinsTransaction }> = ({ transaction }) => {
    const isOutgoing = transaction.from_user_id === user?.id;
    const transactionIcon = renderTransactionIcon(transaction);
    const transactionMessage = formatTransactionMessage(transaction);

    return (
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-muted p-2">{transactionIcon}</div>
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium leading-none">{transactionMessage}</p>
          <p className="text-sm text-muted-foreground">
            {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className={`font-semibold ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
          {isOutgoing ? '-' : '+'} {transaction.amount} <CareCoin className="h-3 w-3 inline" />
        </div>
      </div>
    );
  };

  const renderTransactionIcon = (transaction: CareCoinsTransaction) => {
    const isOutgoing = transaction.from_user_id === user?.id;
    return isOutgoing ? (
      <ArrowDownLeft className="h-4 w-4 text-red-500" />
    ) : (
      <ArrowUpRight className="h-4 w-4 text-green-500" />
    );
  };

  const formatTransactionMessage = (transaction: CareCoinsTransaction) => {
    const isOutgoing = transaction.from_user_id === user?.id;
    const otherUserName = transaction.otherUserName || 'Unknown User';

    if (transaction.transaction_type === 'transfer') {
      return isOutgoing ? `Sent to ${otherUserName}` : `Received from ${otherUserName}`;
    } else if (transaction.transaction_type === 'reward') {
      return `Reward: ${transaction.description || 'CareCoins Reward'}`;
    } else if (transaction.transaction_type === 'purchase') {
      return `Purchase: ${transaction.description || 'CareCoins Purchase'}`;
    } else {
      return 'CareCoins Transaction';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          CareCoins Activity
        </CardTitle>
        <CardDescription>
          Your current balance: <span className="font-semibold">{balance} <CareCoin className="h-3.5 w-3.5 inline" /></span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[350px] overflow-auto pb-1">
        {isLoading ? (
          // Loading skeletons
          <>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          </>
        ) : transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">No recent transactions</p>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Transactions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CareCoinsActivity;
