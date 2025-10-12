/**
 * Action Button with Loading State
 */

import { ReactNode } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ActionButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const ActionButton = ({
  isLoading = false,
  loadingText = 'Loading...',
  icon,
  children,
  disabled,
  ...props
}: ActionButtonProps) => {
  return (
    <Button {...props} disabled={disabled || isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
};
