
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useUserPreferences } from '@/context/UserPreferencesContext';
import { useUpdateUser } from '@/hooks/useUserProfile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { User } from '@/types';

const ProfilePage = () => {
  const { user } = useAuth();
  const { preferences, updatePreference } = useUserPreferences();
  const { mutate: updateUser } = useUpdateUser();
  
  const [profile, setProfile] = useState<Partial<User>>({
    name: '',
    email: '',
    specialty: '',
    licenseNumber: '',
    role: '',
    profileImage: '',
  });
  
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        specialty: user.specialty || '',
        licenseNumber: user.licenseNumber || '',
        role: user.role || '',
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);
  
  const handleProfileChange = (key: string, value: string) => {
    setProfile({ ...profile, [key]: value });
  };
  
  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    try {
      await updateUser({ 
        id: user.id, 
        updates: profile 
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('');
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p>Please log in to view your profile.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        
        <Tabs defaultValue="personal">
          <TabsList className="mb-6">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.profileImage || undefined} />
                    <AvatarFallback className="text-2xl">
                      {getInitials(profile.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="mt-4">{profile.name}</CardTitle>
                  <CardDescription>{profile.role}</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-2">
                  <p className="text-sm">{profile.email}</p>
                  {profile.specialty && (
                    <p className="text-sm text-muted-foreground">
                      Specialty: {profile.specialty}
                    </p>
                  )}
                  {profile.licenseNumber && (
                    <p className="text-sm text-muted-foreground">
                      License: {profile.licenseNumber}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={(e) => handleProfileChange('name', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => handleProfileChange('email', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input 
                      id="specialty" 
                      value={profile.specialty || ''} 
                      onChange={(e) => handleProfileChange('specialty', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <Input 
                      id="license" 
                      value={profile.licenseNumber || ''} 
                      onChange={(e) => handleProfileChange('licenseNumber', e.target.value)} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="image">Profile Image URL</Label>
                    <Input 
                      id="image" 
                      value={profile.profileImage || ''} 
                      onChange={(e) => handleProfileChange('profileImage', e.target.value)} 
                      placeholder="https://example.com/your-image.jpg" 
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleUpdateProfile}>Save Changes</Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Customize your application experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred application theme
                    </p>
                  </div>
                  <Select 
                    value={preferences.theme} 
                    onValueChange={(value) => updatePreference('theme', value as 'light' | 'dark' | 'system')}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable application notifications
                    </p>
                  </div>
                  <Switch 
                    checked={preferences.notification}
                    onCheckedChange={(value) => updatePreference('notification', value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
