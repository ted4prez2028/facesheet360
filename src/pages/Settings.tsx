
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { SendTransaction } from "@/components/wallet/SendTransaction";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email("This is not a valid email"),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
});

export default function Settings() {
  const { user, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      specialty: user?.specialty || "",
      licenseNumber: user?.licenseNumber || "",
      bio: "",
    },
  });

  async function onSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsUpdating(true);
    
    try {
      await updateUserProfile({
        name: values.name,
        specialty: values.specialty,
        licenseNumber: values.licenseNumber,
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and wallet preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={user?.profileImage} alt={user?.name} />
                        <AvatarFallback className="text-lg">
                          {user?.name?.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        Change Avatar
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 py-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                {...field} 
                                disabled 
                              />
                            </FormControl>
                            <FormDescription>
                              Email cannot be changed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="specialty"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Specialty</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., Cardiology" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="License #" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update profile"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Two-factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email about account activity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ConnectWallet />
              <WalletBalance />
            </div>
            
            <SendTransaction />
          </TabsContent>
          
          <TabsContent value="notifications">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
