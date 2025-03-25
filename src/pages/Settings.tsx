
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  BellRing, 
  CircleUser, 
  CreditCard, 
  HelpCircle, 
  Lock, 
  LogOut, 
  Mail, 
  ShieldCheck, 
  Users, 
  Wallet 
} from "lucide-react";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSaveProfile = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    }, 1500);
  };
  
  const [notifications, setNotifications] = useState({
    appointments: true,
    patientUpdates: true,
    systemUpdates: false,
    marketing: false,
    careCoins: true,
  });
  
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <CircleUser className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <BellRing className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="carecoin" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <span>CareCoins</span>
            </TabsTrigger>
            {/* Admin tab would be conditionally rendered based on role */}
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Administration</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and professional information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" defaultValue="Jane" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" defaultValue="Smith" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" defaultValue="dr.jane.smith@healthtrack.com" type="email" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" defaultValue="(555) 123-4567" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select defaultValue="internal-medicine">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                          <SelectItem value="family-practice">Family Practice</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="oncology">Oncology</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License number</Label>
                      <Input id="licenseNumber" defaultValue="MD12345678" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional bio</Label>
                      <Textarea 
                        id="bio" 
                        className="min-h-[120px]"
                        defaultValue="Board-certified in Internal Medicine with over 10 years of experience in managing chronic conditions and preventive healthcare. Specializing in diabetes management and cardiovascular health."
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      className="bg-health-600 hover:bg-health-700" 
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <Avatar className="h-32 w-32 mb-4">
                      <AvatarImage src="/placeholder.svg" alt="Profile" />
                      <AvatarFallback className="text-2xl bg-health-600 text-white">
                        JS
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 w-full">
                      <Button variant="outline" className="w-full">
                        Upload New Photo
                      </Button>
                      <Button variant="outline" className="w-full text-muted-foreground">
                        Remove Photo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Role and Permissions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Current Role</div>
                        <div className="text-muted-foreground text-sm">
                          Determines your access level
                        </div>
                      </div>
                      <Badge>Physician</Badge>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Permissions</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Patient Records - Full Access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Appointment Management</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Prescription Authority</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                          <span className="text-sm">Billing - View Only</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm new password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    
                    <Button className="bg-health-600 hover:bg-health-700">
                      Update Password
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div>Text Message Authentication</div>
                        <div className="text-muted-foreground text-sm">
                          Use SMS as a second authentication factor
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div>Authenticator App</div>
                        <div className="text-muted-foreground text-sm">
                          Use an app like Google Authenticator or Authy
                        </div>
                      </div>
                      <Switch />
                    </div>
                    
                    <Button variant="outline">
                      Configure 2FA
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Session Management</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <div className="font-medium">Current Session</div>
                          <div className="text-xs text-muted-foreground">Chrome on Windows • New York, USA</div>
                          <div className="text-xs text-muted-foreground">Started 2 hours ago</div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <div className="font-medium">Previous Session</div>
                          <div className="text-xs text-muted-foreground">Safari on macOS • Chicago, USA</div>
                          <div className="text-xs text-muted-foreground">3 days ago</div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground h-7">
                          End
                        </Button>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Log Out of All Devices</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Connected Accounts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium">MetaMask</div>
                          <div className="text-sm text-muted-foreground">CareCoins Wallet</div>
                        </div>
                      </div>
                      <Badge>Connected</Badge>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Manage Wallets
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full gap-2">
                      <HelpCircle className="h-4 w-4" />
                      <span>Get Support</span>
                    </Button>
                    
                    <Button variant="outline" className="w-full gap-2 text-destructive hover:text-destructive">
                      <LogOut className="h-4 w-4" />
                      <span>Deactivate Account</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Appointment Reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications about upcoming appointments
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.appointments} 
                      onCheckedChange={() => toggleNotification("appointments")} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Patient Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications when patient data is updated
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.patientUpdates} 
                      onCheckedChange={() => toggleNotification("patientUpdates")} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">System Updates</div>
                      <div className="text-sm text-muted-foreground">
                        Receive notifications about system changes and maintenance
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.systemUpdates} 
                      onCheckedChange={() => toggleNotification("systemUpdates")} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">Marketing & News</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about new features and healthcare news
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.marketing} 
                      onCheckedChange={() => toggleNotification("marketing")} 
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">CareCoins Activity</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about your CareCoins balance and transactions
                      </div>
                    </div>
                    <Switch 
                      checked={notifications.careCoins} 
                      onCheckedChange={() => toggleNotification("careCoins")} 
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notification Methods</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <BellRing className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">In-App Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive notifications in the application
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Email Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive email alerts for important notifications
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">SMS Notifications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive text messages for critical alerts
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-health-600 hover:bg-health-700"
                    onClick={() => {
                      toast({
                        title: "Notification settings updated",
                        description: "Your notification preferences have been saved.",
                      });
                    }}
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="carecoin">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>CareCoins Wallet</CardTitle>
                <CardDescription>
                  Manage your CareCoins balance and transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-health-600 to-health-500 text-white rounded-lg p-6">
                  <div className="space-y-1 mb-4">
                    <div className="text-sm text-white/80">Current Balance</div>
                    <div className="text-3xl font-bold">8,610 CareCoins</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-white/80">Earned This Month</div>
                      <div className="text-lg font-medium">1,250 Coins</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-white/80">Wallet Address</div>
                      <div className="text-sm font-medium truncate">0x7F5c...4E21</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Send Coins
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Receive Coins
                  </Button>
                  <Button className="flex-1 bg-health-600 hover:bg-health-700">
                    Connect MetaMask
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recent Transactions</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Earned from Charting</div>
                          <div className="text-sm text-muted-foreground">Today at 2:45 PM</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-medium">+25 coins</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Earned from Treatment Plan</div>
                          <div className="text-sm text-muted-foreground">Yesterday at 11:30 AM</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-medium">+40 coins</div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Wallet className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">Transferred to MetaMask</div>
                          <div className="text-sm text-muted-foreground">Jun 20, 2023</div>
                        </div>
                      </div>
                      <div className="text-amber-600 font-medium">-100 coins</div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View All Transactions
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Earning Opportunities</h3>
                  
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-1">Complete Patient Charts</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Earn coins for thorough and timely charting
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Up to 25 coins per chart
                      </Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-1">Create Treatment Plans</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Earn coins for comprehensive treatment planning
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Up to 40 coins per plan
                      </Badge>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="font-medium mb-1">Patient Outcome Improvements</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Earn bonus coins for improved patient metrics
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Bonus coins for outcomes
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="admin">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Administration</CardTitle>
                <CardDescription>
                  Manage system settings and user roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">User Management</h3>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-3 text-sm font-medium flex items-center">
                      <div className="flex-1">Name</div>
                      <div className="w-32 text-center">Role</div>
                      <div className="w-32 text-center">Status</div>
                      <div className="w-24 text-right">Actions</div>
                    </div>
                    
                    <div className="divide-y">
                      <div className="px-4 py-3 flex items-center hover:bg-muted/30 transition-colors">
                        <div className="flex-1 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>JS</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Jane Smith</div>
                            <div className="text-sm text-muted-foreground">dr.jane.smith@healthtrack.com</div>
                          </div>
                        </div>
                        <div className="w-32 text-center">
                          <Badge>Doctor</Badge>
                        </div>
                        <div className="w-32 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 flex items-center hover:bg-muted/30 transition-colors">
                        <div className="flex-1 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>RJ</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Robert Johnson</div>
                            <div className="text-sm text-muted-foreground">nurse.robert@healthtrack.com</div>
                          </div>
                        </div>
                        <div className="w-32 text-center">
                          <Badge>Nurse</Badge>
                        </div>
                        <div className="w-32 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 flex items-center hover:bg-muted/30 transition-colors">
                        <div className="flex-1 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>AL</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Amy Lee</div>
                            <div className="text-sm text-muted-foreground">therapist.amy@healthtrack.com</div>
                          </div>
                        </div>
                        <div className="w-32 text-center">
                          <Badge>Therapist</Badge>
                        </div>
                        <div className="w-32 text-center">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <div className="px-4 py-3 flex items-center hover:bg-muted/30 transition-colors">
                        <div className="flex-1 flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>TW</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">Thomas Wilson</div>
                            <div className="text-sm text-muted-foreground">cna.thomas@healthtrack.com</div>
                          </div>
                        </div>
                        <div className="w-32 text-center">
                          <Badge>CNA</Badge>
                        </div>
                        <div className="w-32 text-center">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        </div>
                        <div className="w-24 text-right">
                          <Button variant="ghost" size="sm">Review</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" className="gap-2">
                      <Users className="h-4 w-4" />
                      <span>View All Users</span>
                    </Button>
                    
                    <Button className="gap-2 bg-health-600 hover:bg-health-700">
                      <Plus className="h-4 w-4" />
                      <span>Add User</span>
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Enable CareCoins System</div>
                        <div className="text-sm text-muted-foreground">
                          Toggle the CareCoins reward system
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Facial Recognition</div>
                        <div className="text-sm text-muted-foreground">
                          Enable facial recognition for patient identification
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Automatic Data Backup</div>
                        <div className="text-sm text-muted-foreground">
                          Automatically back up system data
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Maintenance Mode</div>
                        <div className="text-sm text-muted-foreground">
                          Put the system in maintenance mode
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    className="bg-health-600 hover:bg-health-700"
                    onClick={() => {
                      toast({
                        title: "System settings updated",
                        description: "Your changes have been saved.",
                      });
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
