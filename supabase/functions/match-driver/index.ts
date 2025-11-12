import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchDriverRequest {
  rideId: string;
  pickupLatitude: number;
  pickupLongitude: number;
  dropoffLatitude: number;
  dropoffLongitude: number;
  rideType: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rideId, pickupLatitude, pickupLongitude, dropoffLatitude, dropoffLongitude, rideType } = 
      await req.json() as MatchDriverRequest;

    console.log('Matching driver for ride:', rideId, 'at location:', pickupLatitude, pickupLongitude);

    // Find online drivers with their distance from pickup
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'online')
      .eq('is_verified', true)
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    if (driversError) {
      console.error('Error fetching drivers:', driversError);
      throw driversError;
    }

    if (!drivers || drivers.length === 0) {
      console.log('No available drivers found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No available drivers at this time' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Calculate distance for each driver and filter by ride type
    const driversWithDistance = drivers
      .filter(driver => {
        if (rideType === 'wheelchair' && driver.vehicle_type !== 'wheelchair') {
          return false;
        }
        if (rideType === 'premium' && driver.vehicle_type !== 'premium') {
          return false;
        }
        return true;
      })
      .map(driver => {
        const { data: distance } = supabase.rpc('calculate_distance', {
          lat1: pickupLatitude,
          lon1: pickupLongitude,
          lat2: driver.current_latitude,
          lon2: driver.current_longitude
        });
        
        return {
          ...driver,
          distance_km: distance || 999
        };
      })
      .sort((a, b) => a.distance_km - b.distance_km);

    if (driversWithDistance.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `No ${rideType} drivers available at this time` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Select the nearest driver
    const nearestDriver = driversWithDistance[0];
    
    console.log('Nearest driver found:', nearestDriver.id, 'at distance:', nearestDriver.distance_km, 'km');

    // Get driver's profile info
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', nearestDriver.user_id)
      .single();

    // Update driver status to busy
    const { error: updateDriverError } = await supabase
      .from('drivers')
      .update({ 
        status: 'busy',
        updated_at: new Date().toISOString()
      })
      .eq('id', nearestDriver.id);

    if (updateDriverError) {
      console.error('Error updating driver status:', updateDriverError);
      throw updateDriverError;
    }

    // Calculate estimated arrival time (assuming average speed of 30 km/h in city)
    const estimatedMinutes = Math.ceil((nearestDriver.distance_km / 30) * 60);
    const estimatedArrival = new Date(Date.now() + estimatedMinutes * 60000);

    // Calculate driver earnings (80% of ride cost)
    const { data: ride } = await supabase
      .from('rides')
      .select('cost')
      .eq('id', rideId)
      .single();

    const driverEarnings = ride ? ride.cost * 0.8 : 0;

    // Update the ride with driver information
    const { error: updateRideError } = await supabase
      .from('rides')
      .update({
        driver_id: nearestDriver.id,
        driver_name: profile?.name || 'Driver',
        driver_phone: '+1 (555) 123-4567', // Would come from driver profile
        driver_rating: nearestDriver.rating,
        status: 'driver_assigned',
        estimated_arrival: estimatedArrival.toISOString(),
        driver_earnings: driverEarnings,
        updated_at: new Date().toISOString()
      })
      .eq('id', rideId);

    if (updateRideError) {
      console.error('Error updating ride:', updateRideError);
      // Rollback driver status
      await supabase
        .from('drivers')
        .update({ status: 'online' })
        .eq('id', nearestDriver.id);
      throw updateRideError;
    }

    console.log('Driver successfully matched to ride');

    return new Response(
      JSON.stringify({
        success: true,
        driver: {
          id: nearestDriver.id,
          name: profile?.name || 'Driver',
          rating: nearestDriver.rating,
          vehicle_type: nearestDriver.vehicle_type,
          vehicle_make: nearestDriver.vehicle_make,
          vehicle_model: nearestDriver.vehicle_model,
          license_plate: nearestDriver.license_plate,
          estimated_arrival: estimatedArrival,
          distance_km: nearestDriver.distance_km
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in match-driver function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
