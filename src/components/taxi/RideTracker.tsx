import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Clock, User } from 'lucide-react';
import { RideMap } from './RideMap';

interface RideTrackerProps {
  rideId: string;
  pickupLocation: string;
  dropoffLocation: string;
  status: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  estimatedArrival?: string;
}

export const RideTracker = ({
  pickupLocation,
  dropoffLocation,
  status,
  driverName = 'John Doe',
  driverPhone = '+1 (555) 123-4567',
  estimatedArrival = '5 minutes',
}: RideTrackerProps) => {
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Geocode addresses
    const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
      return null;
    };

    geocodeAddress(pickupLocation).then(setPickupCoords);
    geocodeAddress(dropoffLocation).then(setDropoffCoords);
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    // Simulate driver location updates
    if (pickupCoords && status !== 'completed' && status !== 'cancelled') {
      const updateDriverLocation = () => {
        // Simulate movement towards pickup
        const randomOffset = 0.001;
        const newLat = pickupCoords[0] + (Math.random() - 0.5) * randomOffset;
        const newLon = pickupCoords[1] + (Math.random() - 0.5) * randomOffset;
        setDriverCoords([newLat, newLon]);
      };

      updateDriverLocation();
      const interval = setInterval(updateDriverLocation, 5000);
      return () => clearInterval(interval);
    }
  }, [pickupCoords, status]);

  const handleCallDriver = () => {
    window.location.href = `tel:${driverPhone}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'driver_assigned': return 'default';
      case 'en_route': return 'default';
      case 'arrived': return 'default';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Track Your Ride</CardTitle>
          <Badge variant={getStatusColor(status)}>{status.replace('_', ' ')}</Badge>
        </div>
        <CardDescription>Real-time ride tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <RideMap
          pickupCoords={pickupCoords}
          dropoffCoords={dropoffCoords}
          driverCoords={driverCoords}
        />

        {/* Locations */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Pickup</div>
              <div className="text-sm text-muted-foreground">{pickupLocation}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <div className="font-medium">Dropoff</div>
              <div className="text-sm text-muted-foreground">{dropoffLocation}</div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        {status !== 'pending' && status !== 'cancelled' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{driverName}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {estimatedArrival}
                    </div>
                  </div>
                </div>
                <Button onClick={handleCallDriver} size="icon" variant="outline">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};

export default RideTracker;
