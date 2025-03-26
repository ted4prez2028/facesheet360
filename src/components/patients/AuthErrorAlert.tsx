
import React from "react";
import { Link } from "react-router-dom";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthErrorAlertProps {
  isAuthenticated: boolean;
  error: Error | null;
  refetch: () => void;
}

const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({ 
  isAuthenticated, 
  error, 
  refetch 
}) => {
  if (isAuthenticated && !error) return null;
  
  return (
    <>
      {!isAuthenticated && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You need to be logged in to view and manage patients. Please <Link to="/login" className="font-medium underline">log in</Link> with your credentials.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Permission Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Please ensure you're logged in with the correct credentials."}
            <Button 
              variant="outline" 
              className="ml-2" 
              onClick={() => refetch()}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthErrorAlert;
