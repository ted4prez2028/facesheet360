import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Car, MapPin, Calendar, DollarSign, Clock, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PatientAutocomplete } from '@/components/common/PatientAutocomplete';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { AddressAutocomplete } from './AddressAutocomplete';
import { RideMap } from './RideMap';

interface Ride {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  status: string;
  scheduled_time: string;
  estimated_arrival: string;
  patient_id?: string;
  driver_id?: string;
  driver_name?: string;
}

export const TaxiService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const [selectedRideType, setSelectedRideType] = useState('standard');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [userCareCoins, setUserCareCoins] = useState(0);

  // Fetch user's CareCoin balance
  useEffect(() => {
    const fetchUserCareCoins = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('care_coins_balance')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setUserCareCoins(data.care_coins_balance || 0);
      }
    };

    fetchUserCareCoins();
  }, [user]);

  // Fetch rides
  const { data: rides = [] } = useQuery({
    queryKey: ['rides', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Ride[];
    },
    enabled: !!user,
  });

  // Book ride mutation
  const bookRide = useMutation({
    mutationFn: async (rideDetails: {
      pickupLocation: string;
      dropoffLocation: string;
      rideType: string;
      scheduledTime?: string;
      patientId?: string;
      estimatedCost: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check user's CareCoin balance first
      const { data: profileData } = await supabase
        .from('profiles')
        .select('care_coins_balance')
        .eq('id', user.id)
        .single();

      if (!profileData || profileData.care_coins_balance < rideDetails.estimatedCost) {
        throw new Error('Insufficient CareCoins balance');
      }

      const { data, error } = await supabase.functions.invoke('book-ride', {
        body: {
          userId: user.id,
          ...rideDetails,
          pickupLatitude: pickupCoords?.[0],
          pickupLongitude: pickupCoords?.[1],
          dropoffLatitude: dropoffCoords?.[0],
          dropoffLongitude: dropoffCoords?.[1],
          distanceKm: routeDistance ? routeDistance / 1000 : null
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['care-coins-balance'] });
      toast.success('Ride booked successfully! CareCoins deducted from your balance.');
      setPickupLocation('');
      setDropoffLocation('');
      setScheduledTime('');
      // Refresh balance
      (async () => {
        const { data } = await supabase
          .from('profiles')
          .select('care_coins_balance')
          .eq('id', user!.id)
          .single();
        if (data) setUserCareCoins(data.care_coins_balance || 0);
      })();
    },
    onError: (error: Error) => {
      toast.error(`Failed to book ride: ${error.message}`);
    }
  });

  const handleBookRide = () => {
    if (!pickupLocation || !dropoffLocation) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }

    // Calculate estimated cost based on ride type
    const estimatedCost = selectedRideType === 'premium' ? 100 : 
                         selectedRideType === 'wheelchair' ? 75 : 50;

    if (userCareCoins < estimatedCost) {
      toast.error(`Insufficient CareCoins. You need ${estimatedCost} CareCoins but have ${userCareCoins}`);
      return;
    }

    bookRide.mutate({
      pickupLocation,
      dropoffLocation,
      rideType: selectedRideType,
      scheduledTime: scheduledTime || undefined,
      patientId: selectedPatient?.id,
      estimatedCost
    });
  };

  const calculateEstimatedCost = (rideType: string): number => {
    const baseCosts = {
      standard: 1.5,
      premium: 2.5,
      wheelchair: 2.0
    };
    const perKmRate = baseCosts[rideType as keyof typeof baseCosts] || 1.5;
    const baseFare = rideType === 'premium' ? 20 : rideType === 'wheelchair' ? 15 : 10;
    
    if (routeDistance) {
      const distanceKm = routeDistance / 1000;
      return Math.ceil(baseFare + (distanceKm * perKmRate));
    }
    
    return baseFare;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'driver_assigned': return 'bg-purple-500';
      case 'en_route': return 'bg-orange-500';
      case 'arrived': return 'bg-green-500';
      case 'in_progress': return 'bg-indigo-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* CareCoin Balance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            CareCoin Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {userCareCoins.toLocaleString()} CareCoins
          </div>
          <p className="text-sm text-muted-foreground">Available for ride payments</p>
        </CardContent>
      </Card>

      {/* Book New Ride */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Book a Ride with CareCoins
          </CardTitle>
          <CardDescription>
            Pay for transportation using your earned CareCoins. Standard rides: 50 CC, Wheelchair accessible: 75 CC, Premium: 100 CC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interactive Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Route Preview</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                        setPickupCoords(coords);
                        toast.success('Using your current location as pickup');
                      },
                      (error) => {
                        toast.error('Could not get your location. Please enable location services.');
                        console.error('Geolocation error:', error);
                      }
                    );
                  } else {
                    toast.error('Geolocation is not supported by your browser');
                  }
                }}
              >
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </div>
            <RideMap 
              pickupCoords={pickupCoords}
              dropoffCoords={dropoffCoords}
              onRouteFound={(distance, duration) => {
                setRouteDistance(distance);
                setRouteDuration(duration);
              }}
            />
            {routeDistance && routeDuration && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Distance: {(routeDistance / 1000).toFixed(2)} km</span>
                <span>Estimated Time: {Math.ceil(routeDuration / 60)} min</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">
                <MapPin className="h-4 w-4 inline mr-2" />
                Pickup Location
              </Label>
              <AddressAutocomplete
                value={pickupLocation}
                onChange={setPickupLocation}
                onLocationSelect={(lat, lon) => setPickupCoords([lat, lon])}
                placeholder="Search pickup address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff">
                <MapPin className="h-4 w-4 inline mr-2" />
                Dropoff Location
              </Label>
              <AddressAutocomplete
                value={dropoffLocation}
                onChange={setDropoffLocation}
                onLocationSelect={(lat, lon) => setDropoffCoords([lat, lon])}
                placeholder="Search dropoff address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ride-type">Ride Type</Label>
            <Select value={selectedRideType} onValueChange={setSelectedRideType}>
              <SelectTrigger id="ride-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (Base: 10 CC + 1.5 CC/km)</SelectItem>
                <SelectItem value="wheelchair">Wheelchair Accessible (Base: 15 CC + 2 CC/km)</SelectItem>
                <SelectItem value="premium">Premium (Base: 20 CC + 2.5 CC/km)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled-time">
              <Calendar className="h-4 w-4 inline mr-2" />
              Scheduled Time (Optional)
            </Label>
            <Input
              id="scheduled-time"
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Patient (Optional)</Label>
            <PatientAutocomplete
              onSelect={setSelectedPatient}
              value={selectedPatient}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Cost:</span>
              <span className="text-lg font-bold text-primary">
                {calculateEstimatedCost(selectedRideType)} CareCoins
              </span>
            </div>
          </div>

          <Button 
            onClick={handleBookRide} 
            disabled={bookRide.isPending}
            className="w-full"
          >
            {bookRide.isPending ? 'Booking...' : 'Book Ride with CareCoins'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Rides</CardTitle>
          <CardDescription>Your ride history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rides.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No rides yet</p>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{ride.pickup_location}</div>
                      <div className="text-sm text-muted-foreground">
                        to {ride.dropoff_location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(ride.scheduled_time).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(ride.status)}`}
                      >
                        {ride.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Show rating option for completed rides */}
                  {ride.status === 'completed' && ride.driver_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        // Import and show RideRating component
                        toast.info('Rating feature coming soon!');
                      }}
                    >
                      Rate Your Driver
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
