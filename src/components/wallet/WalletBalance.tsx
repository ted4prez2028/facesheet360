
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Coins, RefreshCw, TrendingUp } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useRealtimeBalance } from '@/hooks/useRealtimeBalance';
import { Button } from '@/components/ui/button';

export const WalletBalance = () => {
  const { user } = useAuth();
  const { isWalletConnected, tokenBalance, isLoading, refreshBalances } = useWallet();
  const { balance: realtimeBalance } = useRealtimeBalance();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">CareCoins Balance</CardTitle>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-500 animate-pulse" />
          <Coins className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Internal platform balance with real-time updates */}
          <div>
            <div className="text-2xl font-bold">{realtimeBalance || user.care_coins_balance || 0} CC</div>
            <CardDescription className="text-xs flex items-center gap-1">
              Platform Balance
              <span className="text-green-500 text-[10px]">● Live</span>
            </CardDescription>
          </div>
          
          {/* Blockchain token balance - only shown if wallet is connected */}
          {isWalletConnected && (
            <div className="pt-2 border-t mt-2">
              {isLoading ? (
                <Skeleton className="h-7 w-24" />
              ) : (
                <>
                  <div className="text-xl font-bold">{tokenBalance} CARE</div>
                  <div className="flex items-center justify-between">
                    <CardDescription className="text-xs">Blockchain Balance</CardDescription>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={refreshBalances}
                      className="h-6 w-6"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
