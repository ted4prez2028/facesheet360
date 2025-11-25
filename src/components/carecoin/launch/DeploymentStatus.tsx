import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DeploymentStatus = () => {
  const { data: deployments, isLoading } = useQuery({
    queryKey: ["carecoin-deployment-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carecoin_deployment_status")
        .select("*")
        .order("deployed_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    if (phase.includes("testnet")) return "secondary";
    if (phase.includes("mainnet")) return "default";
    if (phase.includes("verified")) return "success";
    return "outline";
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading deployment status...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deployment History</h3>
        <Button variant="outline" size="sm">
          Deploy to Mainnet
        </Button>
      </div>

      <div className="space-y-3">
        {deployments?.map((deployment) => (
          <Card key={deployment.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(deployment.status)}
                  <CardTitle className="text-base">
                    {deployment.deployment_phase.replace(/_/g, " ").toUpperCase()}
                  </CardTitle>
                  <Badge variant={getPhaseColor(deployment.deployment_phase) as any}>
                    {deployment.network}
                  </Badge>
                </div>
                <Badge variant={deployment.status === "success" ? "default" : "destructive"}>
                  {deployment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {deployment.contract_address && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contract:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {deployment.contract_address.slice(0, 10)}...{deployment.contract_address.slice(-8)}
                  </code>
                </div>
              )}
              {deployment.transaction_hash && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">TX Hash:</span>
                  <a
                    href={`https://polygonscan.com/tx/${deployment.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <span className="text-xs">{deployment.transaction_hash.slice(0, 10)}...</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {deployment.gas_used && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gas Used:</span>
                  <span className="font-mono">{Number(deployment.gas_used).toLocaleString()}</span>
                </div>
              )}
              {deployment.liquidity_pool_address && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Liquidity Pool:</span>
                  <Badge variant="outline">Created</Badge>
                </div>
              )}
              {deployment.polygonscan_verified && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Verification:</span>
                  <Badge variant="default" className="bg-success text-success-foreground">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              )}
              {deployment.error_message && (
                <div className="text-xs text-destructive mt-2 p-2 bg-destructive/10 rounded">
                  {deployment.error_message}
                </div>
              )}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Deployed: {deployment.deployed_at ? new Date(deployment.deployed_at).toLocaleString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        ))}

        {deployments?.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No deployments yet. Start by deploying to testnet first.
          </div>
        )}
      </div>
    </div>
  );
};
