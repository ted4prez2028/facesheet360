
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
  
  const isPatientNotFoundError = error?.message?.includes("Patient not found") || error?.message?.includes("not found");
  const isPermissionError = error?.message?.includes("permission") || error?.message?.includes("access");
  
  return (
    <div className="space-y-4">
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
        <Alert variant={
          isPatientNotFoundError ? "warning" : 
          isPermissionError ? "warning" : 
          "destructive"
        }>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {isPatientNotFoundError 
              ? "Patient Not Found" 
              : isPermissionError 
                ? "Permission Denied"
                : "Error Loading Patient Data"
            }
          </AlertTitle>
          <AlertDescription className="flex flex-col space-y-2">
            <div>
              {isPatientNotFoundError 
                ? "The requested patient could not be found. It may have been deleted or you may not have permission to view it."
                : isPermissionError
                  ? "You don't have permission to view this patient. Please contact your administrator if you believe this is an error."
                  : error instanceof Error 
                    ? error.message 
                    : "Unable to load patient data. Please try again later."}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                size="sm"
                className="mt-1"
              >
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                asChild
                size="sm"
                className="mt-1"
              >
                <Link to="/patients">Back to Patients</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AuthErrorAlert;
