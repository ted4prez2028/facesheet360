import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { useCareCoinPrice } from '@/hooks/useCareCoinPrice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const MarketPriceDisplay = () => {
  const { data: priceData, isLoading, refetch } = useCareCoinPrice();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading market price...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <CardTitle>Market Price</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Real-time CARE token value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {priceData && (
          <>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-500">
                {priceData.priceFormatted}
              </div>
              <p className="text-sm text-muted-foreground">per CARE token</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={priceData.source === 'uniswap_v3' ? 'default' : 'secondary'}>
                {priceData.source === 'uniswap_v3' ? '🔵 Live Oracle' : '📊 Default Price'}
              </Badge>
              {priceData.source === 'uniswap_v3' && (
                <Badge variant="outline" className="text-xs">
                  Updated: {new Date(priceData.timestamp || '').toLocaleTimeString()}
                </Badge>
              )}
            </div>

            {priceData.maticUsdPrice && (
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">Reference Prices</p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>MATIC/USD:</span>
                    <span className="font-medium">${priceData.maticUsdPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network:</span>
                    <span className="font-medium">Polygon</span>
                  </div>
                </div>
              </div>
            )}

            {priceData.poolAddress && (
              <div className="pt-2">
                <a
                  href={`https://polygonscan.com/address/${priceData.poolAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                  View Uniswap Pool →
                </a>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};