import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Clock, DollarSign, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Ride {
  id: string;
  pickup_location: string;
  dropoff_location: string;
  ride_type: string;
  status: string;
  estimated_cost_carecoins: number;
  estimated_arrival_time: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_info?: string;
  created_at: string;
}

const TaxiService = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropoffLocation: '',
    rideType: 'to_facility',
    patientId: '',
    scheduledTime: ''
  });

  const [userCareCoins, setUserCareCoins] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRides();
      fetchUserCareCoins();
    }
  }, [user]);

  const fetchUserCareCoins = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('users')
      .select('care_coins_balance')
      .eq('id', user.id)
      .single();
    
    setUserCareCoins(data?.care_coins_balance || 0);
  };

  const fetchRides = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rides:', error);
      return;
    }

    setRides(data || []);
  };

  const handleBookRide = async () => {
    if (!user) return;

    setIsBooking(true);

    try {
      // Calculate estimated cost (base rate + distance estimate)
      const estimatedCost = calculateEstimatedCost(formData.rideType);

      const { data, error } = await supabase.functions.invoke('book-ride', {
        body: {
          userId: user.id,
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
          rideType: formData.rideType,
          patientId: formData.patientId || null,
          scheduledTime: formData.scheduledTime || null,
          estimatedCost
        }
      });

      if (error) throw error;

      toast({
        title: 'Ride Booked Successfully',
        description: `Your ${formData.rideType.replace('_', ' ')} ride has been booked. Estimated cost: ${estimatedCost} CareCoins`,
      });

      // Reset form
      setFormData({
        pickupLocation: '',
        dropoffLocation: '',
        rideType: 'to_facility',
        patientId: '',
        scheduledTime: ''
      });

      // Refresh rides list
      fetchRides();
      fetchUserCareCoins();

    } catch (error) {
      console.error('Error booking ride:', error);
      toast({
        title: 'Booking Failed',
        description: 'Unable to book ride. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const calculateEstimatedCost = (rideType: string): number => {
    const baseCosts = {
      to_facility: 50,
      from_facility: 50,
      between_facilities: 75,
      to_appointment: 60,
      home: 40
    };
    return baseCosts[rideType as keyof typeof baseCosts] || 50;
  };

  const getRideTypeLabel = (type: string) => {
    const labels = {
      to_facility: 'To Healthcare Facility',
      from_facility: 'From Healthcare Facility',
      between_facilities: 'Between Facilities',
      to_appointment: 'To Appointment',
      home: 'To Home'
    };
    return labels[type as keyof typeof labels] || type;
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
            Book a Ride
          </CardTitle>
          <CardDescription>
            Book transportation using CareCoins. Rides are tracked in real-time with driver location and estimated arrival times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input
                id="pickup"
                placeholder="Enter pickup address"
                value={formData.pickupLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupLocation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropoff">Dropoff Location</Label>
              <Input
                id="dropoff"
                placeholder="Enter destination address"
                value={formData.dropoffLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, dropoffLocation: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rideType">Ride Type</Label>
              <Select value={formData.rideType} onValueChange={(value) => setFormData(prev => ({ ...prev, rideType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ride type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_facility">To Healthcare Facility (50 CC)</SelectItem>
                  <SelectItem value="from_facility">From Healthcare Facility (50 CC)</SelectItem>
                  <SelectItem value="between_facilities">Between Facilities (75 CC)</SelectItem>
                  <SelectItem value="to_appointment">To Appointment (60 CC)</SelectItem>
                  <SelectItem value="home">To Home (40 CC)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Scheduled Time (Optional)</Label>
              <Input
                id="scheduledTime"
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID (Optional)</Label>
            <Input
              id="patientId"
              placeholder="For patient transport"
              value={formData.patientId}
              onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Estimated Cost: {calculateEstimatedCost(formData.rideType)} CareCoins
            </div>
            <Button 
              onClick={handleBookRide} 
              disabled={isBooking || !formData.pickupLocation || !formData.dropoffLocation}
              className="min-w-32"
            >
              {isBooking ? 'Booking...' : 'Book Ride'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active and Recent Rides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Your Rides
          </CardTitle>
          <CardDescription>Track your current and recent ride requests</CardDescription>
        </CardHeader>
        <CardContent>
          {rides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rides booked yet. Book your first ride above!
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div key={ride.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(ride.status)} text-white`}>
                        {ride.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getRideTypeLabel(ride.ride_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      {ride.estimated_cost_carecoins} CC
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-green-500" />
                      <div>
                        <div className="font-medium">Pickup</div>
                        <div className="text-muted-foreground">{ride.pickup_location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
                      <div>
                        <div className="font-medium">Dropoff</div>
                        <div className="text-muted-foreground">{ride.dropoff_location}</div>
                      </div>
                    </div>
                  </div>

                  {ride.driver_name && (
                    <div className="flex items-center justify-between bg-muted p-3 rounded">
                      <div>
                        <div className="font-medium">Driver: {ride.driver_name}</div>
                        <div className="text-sm text-muted-foreground">{ride.vehicle_info}</div>
                      </div>
                      {ride.estimated_arrival_time && (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          ETA: {new Date(ride.estimated_arrival_time).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}

                  {(ride.status === 'driver_assigned' || ride.status === 'en_route') && (
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="h-4 w-4 mr-2" />
                      Track Driver on Map
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxiService;