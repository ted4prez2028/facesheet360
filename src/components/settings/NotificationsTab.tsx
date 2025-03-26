
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function NotificationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">New Appointments</Label>
            <p className="text-sm text-muted-foreground">
              Notify when a new appointment is scheduled
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">CareCoins Transfers</Label>
            <p className="text-sm text-muted-foreground">
              Notify when you receive CareCoins
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">System Updates</Label>
            <p className="text-sm text-muted-foreground">
              Notify about platform updates and maintenance
            </p>
          </div>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}
