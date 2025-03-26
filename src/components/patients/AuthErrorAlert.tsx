
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
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            You need to be logged in to view and manage patients. 
            <Link to="/login" className="font-medium underline">
              Log in with your credentials
            </Link>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Patient Data</AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <div>
              {error instanceof Error 
                ? error.message 
                : "Unable to load patient data. Please try again later."}
            </div>
            <div>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                size="sm"
                className="mt-1"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default AuthErrorAlert;
