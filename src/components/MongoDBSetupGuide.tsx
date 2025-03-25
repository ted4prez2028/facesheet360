
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink } from "lucide-react";

const MongoDBSetupGuide = () => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>MongoDB Setup Guide</CardTitle>
        <CardDescription>
          Learn how to set up and connect your MongoDB database for HealthTrack
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="atlas">
          <TabsList className="mb-4">
            <TabsTrigger value="atlas">MongoDB Atlas</TabsTrigger>
            <TabsTrigger value="app">MongoDB App Services</TabsTrigger>
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="atlas" className="space-y-4">
            <p>
              MongoDB Atlas is a fully-managed cloud database service that handles all the complexity 
              of deploying, managing, and healing deployments on the cloud service provider of your choice.
            </p>
            
            <ol className="list-decimal ml-6 space-y-2">
              <li>
                Sign up for a free MongoDB Atlas account at{" "}
                <a href="https://www.mongodb.com/cloud/atlas/register" className="text-blue-600 hover:underline flex items-center gap-1">
                  mongodb.com/cloud/atlas <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Create a new cluster (the free tier is sufficient for getting started)</li>
              <li>Set up a database user with appropriate permissions</li>
              <li>Configure IP access (Whitelist your IP or allow access from anywhere for development)</li>
              <li>Get your connection string from the "Connect" button on your cluster</li>
              <li>Update your environment variables with the MongoDB connection string</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="app" className="space-y-4">
            <p>
              MongoDB App Services (formerly Realm) provides a serverless platform that makes it easy 
              to build modern, event-driven applications that connect to MongoDB Atlas.
            </p>
            
            <ol className="list-decimal ml-6 space-y-2">
              <li>In your MongoDB Atlas dashboard, navigate to App Services</li>
              <li>Create a new App</li>
              <li>Link it to your MongoDB Atlas cluster</li>
              <li>Set up authentication providers (email/password, OAuth, etc.)</li>
              <li>Create functions that implement your API endpoints</li>
              <li>Deploy your app</li>
              <li>Use the provided App ID and API key in your environment variables</li>
            </ol>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <p>
              HealthTrack requires several API endpoints to be implemented. Each endpoint should connect 
              to your MongoDB database and perform the necessary operations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Authentication</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/auth/login</li>
                  <li>/auth/register</li>
                  <li>/auth/forgot-password</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Patients</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/patients (GET, POST)</li>
                  <li>/patients/:id (GET, PUT)</li>
                  <li>/patients/face-recognition (POST)</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Charts</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/charts/:patientId (GET)</li>
                  <li>/charts (POST)</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Appointments</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/appointments (GET, POST)</li>
                  <li>/appointments/:id (GET, PUT, DELETE)</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">CareCoins</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/carecoins/balance/:userId (GET)</li>
                  <li>/carecoins/transactions/:userId (GET)</li>
                  <li>/carecoins/transfer (POST)</li>
                </ul>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Facial Recognition</h4>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>/facial-recognition/store (POST)</li>
                  <li>/facial-recognition/recognize (POST)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Alert className="mt-6">
          <AlertDescription>
            All API endpoints should be secured with proper authentication and authorization.
            Make sure to implement field-level access control to protect sensitive patient data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MongoDBSetupGuide;
