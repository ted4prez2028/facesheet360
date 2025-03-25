
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const EnvExample = () => {
  const [showDetails, setShowDetails] = useState(false);

  const envExample = `# MongoDB Connection
MONGODB_API_URL=https://data.mongodb-api.com/app/healthtrack-api/endpoint
MONGODB_API_KEY=your_mongodb_api_key

# Facial Recognition
FACE_API_KEY=your_facial_recognition_api_key
FACE_RECOGNITION_THRESHOLD=0.8

# Authentication
JWT_SECRET=your_secret_key_for_jwt_tokens
TOKEN_EXPIRY=7d

# CareCoins Configuration
CARECOIN_PROVIDER_REWARD=10
CARECOIN_PATIENT_REWARD=2
CARECOIN_OWNER_REWARD=1
CARECOIN_CONTRACT_ADDRESS=0x123456789abcdef

# Application Settings
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://your-app-domain.com

# Admin Configuration
ADMIN_INITIAL_EMAIL=admin@healthtrack.com
ADMIN_INITIAL_PASSWORD=securepassword123`;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Environment Configuration</CardTitle>
        <CardDescription>
          Example environment variables for configuring the HealthTrack application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This is an example .env file. In a production environment, you should
            store these values securely and never commit them to version control.
          </AlertDescription>
        </Alert>

        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide" : "Show"} .env Example
        </Button>

        {showDetails && (
          <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto text-sm">
            {envExample}
          </pre>
        )}

        <div className="mt-4 space-y-2 text-sm">
          <p><strong>MONGODB_API_URL:</strong> The URL endpoint for your MongoDB API</p>
          <p><strong>MONGODB_API_KEY:</strong> Authentication key for MongoDB API access</p>
          <p><strong>FACE_API_KEY:</strong> API key for facial recognition service</p>
          <p><strong>JWT_SECRET:</strong> Secret key used for signing JWT tokens</p>
          <p><strong>CARECOIN_*:</strong> Settings for the CareCoins reward system</p>
          <p><strong>ADMIN_*:</strong> Initial admin account credentials</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnvExample;
