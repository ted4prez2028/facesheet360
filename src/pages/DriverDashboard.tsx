import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Car, MapPin, DollarSign, Clock, CheckCircle, XCircle, 
  Navigation, TrendingUp, Star 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function DriverDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Fetch driver profile
  const { data: driver } = useQuery({
    queryKey: ['driver-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setIsOnline(data.status === 'online');
      return data;
    },
    enabled: !!user,
  });

  // Fetch available rides
  const { data: availableRides = [] } = useQuery({
    queryKey: ['available-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('status', 'driver_assigned')
        .eq('driver_id', driver?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!driver,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch active rides
  const { data: activeRides = [] } = useQuery({
    queryKey: ['active-rides', driver?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', driver?.id)
        .in('status', ['en_route', 'in_progress', 'arrived']);
      
      if (error) throw error;
      return data;
    },
    enabled: !!driver,
    refetchInterval: 3000,
  });

  // Toggle online status
  const toggleOnline = useMutation({
    mutationFn: async (online: boolean) => {
      if (!driver) throw new Error('Driver profile not found');
      
      const { error } = await supabase
        .from('drivers')
        .update({ 
          status: online ? 'online' : 'offline',
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id);
      
      if (error) throw error;
      return online;
    },
    onSuccess: (online) => {
      setIsOnline(online);
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      toast.success(online ? 'You are now online' : 'You are now offline');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    }
  });

  // Update location
  const updateLocation = useMutation({
    mutationFn: async (position: GeolocationPosition) => {
      const { data, error } = await supabase.functions.invoke('update-driver-location', {
        body: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      console.log('Location updated successfully');
    }
  });

  // Driver action (accept/reject/complete)
  const driverAction = useMutation({
    mutationFn: async ({ rideId, action }: { rideId: string; action: string }) => {
      const { data, error } = await supabase.functions.invoke('driver-action', {
        body: { rideId, action }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['available-rides'] });
      queryClient.invalidateQueries({ queryKey: ['active-rides'] });
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
      
      const actionMessages = {
        accept: 'Ride accepted!',
        reject: 'Ride rejected',
        complete: 'Ride completed!',
        cancel: 'Ride cancelled'
      };
      
      toast.success(actionMessages[variables.action as keyof typeof actionMessages]);
    },
    onError: (error: Error) => {
      toast.error(`Action failed: ${error.message}`);
    }
  });

  // Start location tracking
  useEffect(() => {
    if (!isOnline || !driver) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation.mutate(position);
      },
      (error) => {
        console.error('Location error:', error);
        toast.error('Failed to get location. Please enable location services.');
        setLocationEnabled(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );

    setLocationEnabled(true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isOnline, driver]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'driver_assigned': return 'bg-blue-500';
      case 'en_route': return 'bg-orange-500';
      case 'arrived': return 'bg-green-500';
      case 'in_progress': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  if (!driver) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Driver Profile Not Found</CardTitle>
            <CardDescription>
              Please contact support to set up your driver account.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <div className="flex items-center gap-4">
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {locationEnabled && (
            <Badge variant="outline">
              <Navigation className="h-3 w-3 mr-1" />
              GPS Active
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.total_rides}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.total_earnings.toFixed(2)} CC</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {driver.rating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driver.care_coins_balance.toFixed(2)} CC</div>
          </CardContent>
        </Card>
      </div>

      {/* Online Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
          <CardDescription>Turn on to start receiving ride requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="online-toggle" className="text-base">
              {isOnline ? 'Currently accepting rides' : 'Currently unavailable'}
            </Label>
            <Switch
              id="online-toggle"
              checked={isOnline}
              onCheckedChange={(checked) => toggleOnline.mutate(checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Available Rides */}
      {availableRides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>New Ride Request</CardTitle>
            <CardDescription>Accept or decline this ride</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(ride.status)}>
                    {ride.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-lg font-bold">{ride.driver_earnings?.toFixed(2) || '0.00'} CC</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-green-500" />
                    <div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-muted-foreground">{ride.pickup_location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-red-500" />
                    <div>
                      <div className="font-medium">Dropoff</div>
                      <div className="text-sm text-muted-foreground">{ride.dropoff_location}</div>
                    </div>
                  </div>
                  {ride.distance_km && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      {ride.distance_km.toFixed(2)} km
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => driverAction.mutate({ rideId: ride.id, action: 'accept' })}
                    disabled={driverAction.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Ride
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => driverAction.mutate({ rideId: ride.id, action: 'reject' })}
                    disabled={driverAction.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Rides */}
      {activeRides.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Ride</CardTitle>
            <CardDescription>Currently in progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeRides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(ride.status)}>
                    {ride.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-lg font-bold">{ride.driver_earnings?.toFixed(2) || '0.00'} CC</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-green-500" />
                    <div>
                      <div className="font-medium">Pickup</div>
                      <div className="text-sm text-muted-foreground">{ride.pickup_location}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-red-500" />
                    <div>
                      <div className="font-medium">Dropoff</div>
                      <div className="text-sm text-muted-foreground">{ride.dropoff_location}</div>
                    </div>
                  </div>
                  {ride.estimated_arrival && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      ETA: {new Date(ride.estimated_arrival).toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => driverAction.mutate({ rideId: ride.id, action: 'complete' })}
                  disabled={driverAction.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Ride
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isOnline && availableRides.length === 0 && activeRides.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Waiting for ride requests...</p>
            <p className="text-sm text-muted-foreground">You'll be notified when a new ride is available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
