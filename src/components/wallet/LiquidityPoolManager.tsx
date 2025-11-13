import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Droplets, ExternalLink, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useCareCoinPrice } from '@/hooks/useCareCoinPrice';

export const LiquidityPoolManager = () => {
  const [careAmount, setCareAmount] = useState('100000');
  const [usdcAmount, setUsdcAmount] = useState('50000');
  const [isCreating, setIsCreating] = useState(false);

  const { data: priceData, isLoading: priceLoading } = useCareCoinPrice();

  const { data: deploymentData, isLoading: contractLoading } = useQuery({
    queryKey: ['carecoin-deployment-pool'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('carecoin_deployment_status')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const hasPool = deploymentData?.liquidity_pool_address;

  const handleCreatePool = async () => {
    if (!careAmount || !usdcAmount) {
      toast.error('Please enter both CARE and USDC amounts');
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-liquidity-pool', {
        body: {
          careAmount: parseFloat(careAmount),
          usdcAmount: parseFloat(usdcAmount),
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message || 'Liquidity pool created successfully!');
        // Refetch contract data to update UI
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to create pool');
      }
    } catch (error: any) {
      console.error('Pool creation error:', error);
      toast.error(error.message || 'Failed to create liquidity pool');
    } finally {
      setIsCreating(false);
    }
  };

  if (contractLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading pool data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Uniswap V3 Liquidity Pool
        </CardTitle>
        <CardDescription>
          Manage CARE/USDC trading liquidity on Polygon
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {priceData && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-500">Current Market Price</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{priceData.priceFormatted} per CARE</div>
                <div className="text-xs text-muted-foreground">
                  Source: {priceData.source === 'uniswap_v3' ? 'Uniswap V3 Oracle' : 'Default Price'}
                  {priceData.maticUsdPrice && (
                    <span className="ml-2">• MATIC: ${priceData.maticUsdPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {hasPool ? (
          <Alert className="border-green-500/50 bg-green-500/10">
            <Droplets className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">Liquidity Pool Active</AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="space-y-1">
                <p className="font-medium">Pool Address:</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all flex-1 bg-background p-2 rounded">
                    {deploymentData?.liquidity_pool_address}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <a
                      href={`https://polygonscan.com/address/${deploymentData?.liquidity_pool_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Liquidity Added</p>
                  <p className="font-medium">
                    ${deploymentData?.liquidity_added?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Network</p>
                  <p className="font-medium">
                    {deploymentData?.network || 'Polygon'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ✅ Real-time price discovery enabled
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Create a Uniswap V3 liquidity pool to enable decentralized trading and real-time price discovery for CARE tokens.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="careAmount">CARE Amount</Label>
                <Input
                  id="careAmount"
                  type="number"
                  placeholder="100000"
                  value={careAmount}
                  onChange={(e) => setCareAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Number of CARE tokens to add as liquidity
                </p>
              </div>

              <div>
                <Label htmlFor="usdcAmount">USDC Amount</Label>
                <Input
                  id="usdcAmount"
                  type="number"
                  placeholder="50000"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  USD value in USDC (initial price = {usdcAmount ? `$${(parseFloat(usdcAmount) / parseFloat(careAmount || '1')).toFixed(4)}` : '$0.50'} per CARE)
                </p>
              </div>

              <Button
                onClick={handleCreatePool}
                disabled={isCreating || !careAmount || !usdcAmount}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Pool...
                  </>
                ) : (
                  <>
                    <Droplets className="mr-2 h-4 w-4" />
                    Create Liquidity Pool
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};