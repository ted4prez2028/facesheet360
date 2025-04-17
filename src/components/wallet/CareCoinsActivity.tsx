
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import { useAuth } from '@/context/AuthContext';
import { useCareCoinsTransactions } from '@/hooks/useCareCoinsTransactions';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CareCoinsTransaction } from '@/types';

interface CareCoinsActivityProps {
  onViewAll?: () => void;
}

export const CareCoinsActivity: React.FC<CareCoinsActivityProps> = ({ onViewAll }) => {
  const { user } = useAuth();
  const { transactions, isLoading } = useCareCoinsTransactions();
  const balance = user?.careCoinsBalance || 0;

  const TransactionItem: React.FC<{ transaction: CareCoinsTransaction }> = ({ transaction }) => {
    const isOutgoing = transaction.from_user_id === user?.id;
    const transactionIcon = renderTransactionIcon(transaction);
    const [showDetails, setShowDetails] = React.useState(false);

    const handleClick = () => {
      setShowDetails(!showDetails);
    };

    return (
      <div onClick={handleClick} className="flex flex-col gap-2 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${getTransactionColor(transaction)}`}>
            {transactionIcon}
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{formatTransactionMessage(transaction)}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <div className={`font-semibold ${isOutgoing ? 'text-red-500' : 'text-green-500'}`}>
            {isOutgoing ? '-' : '+'} {transaction.amount}
            <span className="inline-flex items-center"><Coins className="h-3 w-3 inline ml-1" /></span>
          </div>
        </div>
        
        {showDetails && transaction.description && (
          <div className="ml-11 text-sm text-muted-foreground">
            <p>{transaction.description}</p>
            {transaction.reward_category && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                {transaction.reward_category}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTransactionIcon = (transaction: CareCoinsTransaction) => {
    if (transaction.transaction_type === 'reward') {
      return <Coins className="h-4 w-4 text-yellow-500" />;
    }
    const isOutgoing = transaction.from_user_id === user?.id;
    return isOutgoing ? (
      <ArrowDownLeft className="h-4 w-4" />
    ) : (
      <ArrowUpRight className="h-4 w-4" />
    );
  };

  const getTransactionColor = (transaction: CareCoinsTransaction) => {
    if (transaction.transaction_type === 'reward') {
      return 'bg-yellow-100';
    }
    return transaction.from_user_id === user?.id ? 'bg-red-100' : 'bg-green-100';
  };

  const formatTransactionMessage = (transaction: CareCoinsTransaction) => {
    const otherUserName = transaction.otherUserName || 'Unknown User';

    if (transaction.transaction_type === 'reward') {
      return `Reward: ${transaction.description || 'CareCoins Reward'}`;
    } else if (transaction.transaction_type === 'transfer') {
      return transaction.from_user_id === user?.id ? 
        `Sent to ${otherUserName}` : 
        `Received from ${otherUserName}`;
    } else {
      return 'CareCoins Transaction';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your current balance: <span className="font-semibold">{balance} <Coins className="h-3.5 w-3.5 inline" /></span>
        </CardDescription>
      </CardHeader>
      <ScrollArea className="h-[350px]">
        <CardContent className="space-y-1">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))
          ) : transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">No recent transactions</p>
          )}
        </CardContent>
      </ScrollArea>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Transactions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CareCoinsActivity;
