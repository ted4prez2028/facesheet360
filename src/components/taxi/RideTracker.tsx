import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Car, Clock, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RideTrackerProps {
  rideId: string;
  pickup: string;
  dropoff: string;
  driverName?: string;
  driverPhone?: string;
  vehicleInfo?: string;
  estimatedArrival?: string;
  status: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const RideTracker: React.FC<RideTrackerProps> = ({
  rideId,
  pickup,
  dropoff,
  driverName,
  driverPhone,
  vehicleInfo,
  estimatedArrival,
  status
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Google Maps
    if (window.google && mapRef.current) {
      initializeMap();
    } else {
      // Load Google Maps API
      loadGoogleMapsAPI();
    }

    // Set up real-time driver location updates
    const interval = setInterval(fetchDriverLocation, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, [rideId]);

  const loadGoogleMapsAPI = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default center (you can set this to pickup location)
    const center = { lat: 40.7128, lng: -74.0060 }; // New York default

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: center,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    // Add pickup marker
    new window.google.maps.Marker({
      position: center, // You would geocode the pickup address here
      map: mapInstanceRef.current,
      title: 'Pickup Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#22c55e" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Add dropoff marker
    new window.google.maps.Marker({
      position: { lat: center.lat + 0.01, lng: center.lng + 0.01 }, // Slightly offset for demo
      map: mapInstanceRef.current,
      title: 'Dropoff Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#fff" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // If driver location is available, add driver marker
    if (driverLocation) {
      addDriverMarker(driverLocation);
    }
  };

  const addDriverMarker = (location: {lat: number, lng: number}) => {
    if (!mapInstanceRef.current) return;

    new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: `Driver: ${driverName}`,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="#fff" stroke-width="2"/>
            <path d="M8 14s3-2 4-2 4 2 4 2" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            <circle cx="9" cy="9" r="1" fill="#fff"/>
            <circle cx="15" cy="9" r="1" fill="#fff"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40)
      },
      animation: window.google.maps.Animation.BOUNCE
    });

    // Center map on driver location
    mapInstanceRef.current.setCenter(location);
  };

  const fetchDriverLocation = async () => {
    // Simulate fetching driver location from your backend
    // In a real app, this would be a WebSocket connection or polling endpoint
    try {
      // Mock driver location update
      const mockLocation = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.02,
        lng: -74.0060 + (Math.random() - 0.5) * 0.02
      };
      
      setDriverLocation(mockLocation);
      
      if (mapInstanceRef.current) {
        addDriverMarker(mockLocation);
      }
    } catch (error) {
      console.error('Error fetching driver location:', error);
    }
  };

  const handleCallDriver = () => {
    if (driverPhone) {
      window.open(`tel:${driverPhone}`);
    } else {
      toast({
        title: 'Driver Contact',
        description: 'Driver contact information not available yet.',
        variant: 'destructive',
      });
    }
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
      {/* Ride Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Ride #{rideId.slice(0, 8)}
            </CardTitle>
            <Badge className={`${getStatusColor(status)} text-white`}>
              {status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <div className="font-medium">Pickup</div>
                <div className="text-sm text-muted-foreground">{pickup}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-red-500" />
              <div>
                <div className="font-medium">Dropoff</div>
                <div className="text-sm text-muted-foreground">{dropoff}</div>
              </div>
            </div>
          </div>

          {driverName && (
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <div>
                <div className="font-medium">Driver: {driverName}</div>
                <div className="text-sm text-muted-foreground">{vehicleInfo}</div>
                {estimatedArrival && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    ETA: {new Date(estimatedArrival).toLocaleTimeString()}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleCallDriver}>
                <Phone className="h-4 w-4 mr-2" />
                Call Driver
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Live Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-lg border"
            style={{ minHeight: '400px' }}
          />
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Pickup Location
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Dropoff Location
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Driver Location
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideTracker;