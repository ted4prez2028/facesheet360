
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useCareCoinsTransactions } from '@/hooks/useCareCoinsTransactions';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, ArrowDownLeft, Star, Gift } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CareCoinsActivityProps {
  onViewAll?: () => void;
}

export function CareCoinsActivity({ onViewAll }: CareCoinsActivityProps) {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useCareCoinsTransactions();
  const [expanded, setExpanded] = useState(false);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>CareCoins Activity</CardTitle>
          <CardDescription>Your recent CareCoins transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayTransactions = expanded 
    ? transactions 
    : transactions?.slice(0, 3);
    
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'received':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'earned':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'spent':
        return <Gift className="h-4 w-4 text-purple-500" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'sent':
        return 'text-red-500';
      case 'received':
        return 'text-green-500';
      case 'earned':
        return 'text-amber-500';
      case 'spent':
        return 'text-purple-500';
      default:
        return '';
    }
  };
  
  const getTransactionAmount = (transaction: any) => {
    if (transaction.transaction_type === 'sent') {
      return `-${transaction.amount}`;
    } else {
      return `+${transaction.amount}`;
    }
  };
  
  const formatTitle = (transaction: any) => {
    const userName = transaction.otherUserName || 'System';
    
    switch (transaction.transaction_type) {
      case 'sent':
        return `Sent to ${userName}`;
      case 'received':
        return `Received from ${userName}`;
      case 'earned':
        return 'Earned for performance';
      case 'spent':
        return 'Spent on rewards';
      default:
        return transaction.description || 'Transaction';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>CareCoins Activity</CardTitle>
            <CardDescription>Your recent CareCoins transactions</CardDescription>
          </div>
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            Balance: {user?.care_coins_balance || 0} ©
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={expanded ? "h-[300px]" : "h-auto"}>
          {displayTransactions?.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {displayTransactions?.map(transaction => (
                <div key={transaction.id} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-primary/10">
                      {getTransactionIcon(transaction.transaction_type)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {formatTitle(transaction)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className={`font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                    {getTransactionAmount(transaction)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {transactions && transactions.length > 3 && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setExpanded(prev => !prev)} 
              size="sm"
            >
              {expanded ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        )}
        
        {onViewAll && (
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={onViewAll} 
              size="sm" 
              className="text-primary"
            >
              View All Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CareCoinsActivity;
