import { Badge } from '@/components/ui/badge';
import { Network } from 'lucide-react';

export const PolygonNetworkBadge = () => {
  return (
    <Badge variant="secondary" className="flex items-center gap-2">
      <Network className="h-4 w-4" />
      <span>Polygon Network</span>
      <span className="text-xs opacity-70">(99% Lower Gas Fees)</span>
    </Badge>
  );
};