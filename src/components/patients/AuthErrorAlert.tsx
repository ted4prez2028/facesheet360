
import React from 'react';
import { AlertCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthErrorAlertProps {
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => void;
}

const AuthErrorAlert = ({ isAuthenticated, error, refetch }: AuthErrorAlertProps) => {
  if (!error && isAuthenticated) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          <p className="mb-2">You need to be logged in to view this content.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/login'}
            className="mt-2"
          >
            Go to Login
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Check for specific error messages
  const errorMessage = error?.message || '';
  const isPermissionError = errorMessage.includes('permission') || 
                           errorMessage.includes('access') || 
                           errorMessage.includes('not allowed');

  const isServerError = errorMessage.includes('500') || 
                       errorMessage.includes('server') || 
                       errorMessage.includes('failed');
                       
  const isAuthError = errorMessage.includes('auth') || 
                     errorMessage.includes('token') || 
                     errorMessage.includes('login');

  let variant: "default" | "destructive" = "destructive";
  let title = "An error occurred";
  let icon = <AlertCircle className="h-4 w-4" />;
  
  if (isPermissionError) {
    title = "Access Denied";
    icon = <AlertTriangle className="h-4 w-4" />;
  } else if (isServerError) {
    title = "Server Error";
  } else if (isAuthError) {
    title = "Authentication Error";
  }

  return (
    <Alert variant={variant} className="mb-6">
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{errorMessage}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refetch} 
          className="mt-2"
        >
          <RefreshCcw className="mr-2 h-3 w-3" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default AuthErrorAlert;
