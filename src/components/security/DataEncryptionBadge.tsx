/**
 * Data Encryption Indicator for HIPAA Compliance
 */

import { Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DataEncryptionBadgeProps {
  variant?: 'at-rest' | 'in-transit' | 'both';
}

export const DataEncryptionBadge = ({ variant = 'both' }: DataEncryptionBadgeProps) => {
  const getMessage = () => {
    switch (variant) {
      case 'at-rest':
        return 'Data encrypted at rest with AES-256';
      case 'in-transit':
        return 'Data encrypted in transit with TLS 1.3';
      case 'both':
        return 'Data encrypted at rest (AES-256) and in transit (TLS 1.3)';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="gap-1 cursor-help">
            <Lock className="h-3 w-3" />
            <span className="text-xs">HIPAA Compliant</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-start gap-2 max-w-xs">
            <Shield className="h-4 w-4 mt-0.5 text-green-500" />
            <p className="text-sm">{getMessage()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
