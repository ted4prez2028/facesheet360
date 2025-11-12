import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeploymentStatus } from "@/components/carecoin/launch/DeploymentStatus";
import { GasMonitoring } from "@/components/carecoin/launch/GasMonitoring";
import { KYCManagement } from "@/components/carecoin/launch/KYCManagement";
import { BetaTesterManagement } from "@/components/carecoin/launch/BetaTesterManagement";
import { FeatureFlagsAdmin } from "@/components/carecoin/launch/FeatureFlagsAdmin";
import { Rocket, Shield, TestTube, Flag, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CareCoinLaunch() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">CareCoin Launch Control</h1>
        <p className="text-muted-foreground">
          Manage the complete CareCoin deployment lifecycle from testnet to production
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Admin Only</AlertTitle>
        <AlertDescription>
          This dashboard controls critical CareCoin infrastructure. All actions are logged and monitored.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="deployment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="deployment" className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Phase 3: Deploy
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Phase 4: Legal
          </TabsTrigger>
          <TabsTrigger value="beta" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Phase 5: Beta
          </TabsTrigger>
          <TabsTrigger value="launch" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Phase 6: Launch
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phase 3: Mainnet Deployment</CardTitle>
              <CardDescription>
                Deploy CareCoin to Polygon mainnet, create liquidity pools, and verify contracts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DeploymentStatus />
              <GasMonitoring />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phase 4: Legal Compliance</CardTitle>
              <CardDescription>
                KYC verification, tax reporting, and legal disclaimer management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KYCManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phase 5: Beta Testing</CardTitle>
              <CardDescription>
                Manage beta testers, collect feedback, and monitor soft launch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BetaTesterManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="launch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phase 6: Full Launch</CardTitle>
              <CardDescription>
                Feature flags, gradual rollout, and production monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureFlagsAdmin />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Monitoring</CardTitle>
              <CardDescription>
                Transaction alerts, security events, and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitoring dashboard with real-time alerts coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
