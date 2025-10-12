/**
 * Reusable Page Header Component
 */

import { ReactNode } from 'react';
import { DataEncryptionBadge } from '@/components/security/DataEncryptionBadge';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  showEncryption?: boolean;
}

export const PageHeader = ({ 
  title, 
  description, 
  action,
  showEncryption = true 
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {showEncryption && <DataEncryptionBadge />}
        </div>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
