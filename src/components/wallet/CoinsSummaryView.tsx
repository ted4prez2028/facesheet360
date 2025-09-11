import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCareCoins } from '@/hooks/useCareCoins';

export const CoinsSummaryView = () => {
  const { user } = useAuth();
  const { getBalance, getTransactions, transfer } = useCareCoins();
  const [balance, setBalance] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [usdValue, setUsdValue] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchBalance = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const balanceData = await getBalance(user.id);
        setBalance(balanceData?.balance || 0);
        setTotalEarned(balanceData?.totalEarned || 0);
        setUsdValue(balanceData?.usdValue || 0);
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchTransactions = async () => {
    if (user?.id) {
      setIsLoading(true);
      try {
        const transactionsData = await getTransactions(user.id);
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    const interval = setInterval(() => {
      fetchBalance();
      fetchTransactions();
    }, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleTransfer = async () => {
    if (!user?.id) return;
    const toUserId = prompt('Recipient user ID?');
    const amountStr = prompt('Amount of CareCoins to send?');
    const amount = Number(amountStr);
    if (!toUserId || isNaN(amount)) return;
    try {
      await transfer(user.id, toUserId, amount);
      await fetchBalance();
      await fetchTransactions();
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            CareCoins Summary
          </CardTitle>
          <CardDescription>Your universal health credits</CardDescription>
          <div className="mt-2">
            <Button size="sm" onClick={handleTransfer}>Send Coins</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg shadow-custom-light">
              <h3 className="text-2xl font-bold text-primary">{balance || 0}</h3>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="text-center p-4 bg-health-50 rounded-lg shadow-custom-light">
              <h3 className="text-2xl font-bold text-health-700">{totalEarned || 0}</h3>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center p-4 bg-health-50 rounded-lg shadow-custom-light">
              <h3 className="text-2xl font-bold text-health-700">${usdValue?.toFixed(2) || '0.00'}</h3>
              <p className="text-sm text-muted-foreground">USD Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((transaction: any) => (
                <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{String(transaction.transaction_type || 'Unknown')}</p>
                    <p className="text-sm text-muted-foreground">
                      {String(transaction.description || 'No description')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} CC
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No recent transactions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
