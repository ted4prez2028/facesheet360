/**
 * Role-Based Access Control Component
 */

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AccessControlProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'doctor' | 'nurse' | 'therapist' | 'cna')[];
  fallback?: ReactNode;
}

export const AccessControl = ({ 
  children, 
  allowedRoles,
  fallback 
}: AccessControlProps) => {
  const { user } = useAuth();

  if (!user) {
    return fallback || <AccessDenied message="Please log in to access this feature" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return fallback || <AccessDenied message="You don't have permission to access this feature" />;
  }

  return <>{children}</>;
};

const AccessDenied = ({ message }: { message: string }) => (
  <Card className="border-destructive">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-destructive" />
        <div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>{message}</CardDescription>
        </div>
      </div>
    </CardHeader>
  </Card>
);
