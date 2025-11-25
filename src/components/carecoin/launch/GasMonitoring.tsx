import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Fuel, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const GasMonitoring = () => {
  const { data: gasData } = useQuery({
    queryKey: ["gas-wallet-monitoring"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gas_wallet_monitoring")
        .select("*")
        .order("checked_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (!gasData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Fuel className="h-5 w-5" />
            Gas Wallet Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No gas monitoring data available</p>
        </CardContent>
      </Card>
    );
  }

  const balancePercentage = (Number(gasData.balance) / Number(gasData.alert_threshold)) * 100;
  const isLowBalance = balancePercentage < 20;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Fuel className="h-5 w-5" />
          Gas Wallet Monitoring
          {isLowBalance && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Balance
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className="font-mono font-semibold">{Number(gasData.balance).toFixed(2)} MATIC</span>
          </div>
          <Progress value={Math.min(balancePercentage, 100)} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Threshold: {Number(gasData.alert_threshold)} MATIC</span>
            <span>{balancePercentage.toFixed(0)}% remaining</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Gas Spent</div>
            <div className="font-mono text-sm">{Number(gasData.total_gas_spent).toFixed(4)} MATIC</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Transactions</div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="font-mono text-sm">{gasData.transaction_count}</span>
            </div>
          </div>
        </div>

        {gasData.last_refill_at && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground mb-1">Last Refill</div>
            <div className="text-sm">
              {Number(gasData.last_refill_amount).toFixed(2)} MATIC on{" "}
              {new Date(gasData.last_refill_at).toLocaleDateString()}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Last checked: {new Date(gasData.created_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};
