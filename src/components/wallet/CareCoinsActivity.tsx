
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react";
import { useCareCoinsTransactions } from "@/hooks/useCareCoinsTransactions";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface CareCoinsActivityProps {
  onViewAll?: () => void;
  className?: string;
}

export const CareCoinsActivity: React.FC<CareCoinsActivityProps> = ({ 
  onViewAll, 
  className 
}) => {
  const { data: transactions = [], isLoading } = useCareCoinsTransactions();

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "transfer":
      case "reward":
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case "purchase":
      case "spent":
        return <ArrowDownLeft className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "transfer":
      case "reward":
        return "text-green-600";
      case "purchase":
      case "spent":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = ["transfer", "reward"].includes(type) ? "+" : "-";
    return `${prefix}${amount}`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Care Coins Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Care Coins Activity</CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      {getTransactionIcon(transaction.transaction_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {transaction.description || 
                         `${transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1)} Transaction`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className={cn("text-sm font-semibold", getTransactionColor(transaction.transaction_type))}>
                    {formatAmount(transaction.amount, transaction.transaction_type)} CC
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CareCoinsActivity;
