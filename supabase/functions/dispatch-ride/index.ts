import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DispatchRideRequest {
  rideId: string;
  pickupLocation: string;
  dropoffLocation: string;
  rideType: string;
  estimatedCost: number;
  userInfo: {
    name: string;
    email: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      rideId,
      pickupLocation,
      dropoffLocation,
      rideType,
      estimatedCost,
      userInfo
    }: DispatchRideRequest = await req.json();

    console.log(`🚨 Dispatching ride ${rideId} for ${userInfo.name}`);

    // Find available driver (simple algorithm - first available driver)
    const { data: availableDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available')
      .limit(1);

    if (driversError) {
      throw driversError;
    }

    if (!availableDrivers || availableDrivers.length === 0) {
      console.log('❌ No available drivers found');
      
      // Update ride status to show no drivers available
      await supabase
        .from('rides')
        .update({ 
          status: 'pending',
          estimated_arrival_time: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .eq('id', rideId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No drivers available at the moment. You will be notified when a driver is found.',
          waitTime: 30
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const driver = availableDrivers[0];
    console.log(`🚗 Assigned driver: ${driver.name} (${driver.vehicle_make} ${driver.vehicle_model})`);

    // Update driver status to busy
    await supabase
      .from('drivers')
      .update({ status: 'busy' })
      .eq('id', driver.id);

    // Update ride with driver assignment
    const estimatedArrival = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    
    await supabase
      .from('rides')
      .update({
        status: 'driver_assigned',
        driver_id: driver.id,
        driver_name: driver.name,
        driver_phone: driver.phone,
        vehicle_info: `${driver.vehicle_color} ${driver.vehicle_make} ${driver.vehicle_model} (${driver.license_plate})`,
        estimated_arrival_time: estimatedArrival.toISOString()
      })
      .eq('id', rideId);

    // Increment driver's total rides
    await supabase
      .from('drivers')
      .update({ total_rides: driver.total_rides + 1 })
      .eq('id', driver.id);

    // Send notification to user about driver assignment
    await supabase
      .from('notifications')
      .insert({
        user_id: (await supabase.from('rides').select('user_id').eq('id', rideId).single()).data?.user_id,
        type: 'ride_notification',
        title: 'Driver Assigned!',
        message: `${driver.name} is coming to pick you up in a ${driver.vehicle_color} ${driver.vehicle_make} ${driver.vehicle_model}. ETA: ${estimatedArrival.toLocaleTimeString()}`,
        read: false
      });

    // Simulate driver updates (in a real app, this would be real-time GPS tracking)
    setTimeout(async () => {
      await supabase
        .from('rides')
        .update({ status: 'en_route' })
        .eq('id', rideId);

      await supabase
        .from('notifications')
        .insert({
          user_id: (await supabase.from('rides').select('user_id').eq('id', rideId).single()).data?.user_id,
          type: 'ride_notification',
          title: 'Driver En Route',
          message: `${driver.name} is on the way to your pickup location.`,
          read: false
        });
    }, 5 * 60 * 1000); // 5 minutes later

    setTimeout(async () => {
      await supabase
        .from('rides')
        .update({ status: 'arrived' })
        .eq('id', rideId);

      await supabase
        .from('notifications')
        .insert({
          user_id: (await supabase.from('rides').select('user_id').eq('id', rideId).single()).data?.user_id,
          type: 'ride_notification',
          title: 'Driver Arrived',
          message: `${driver.name} has arrived at your pickup location!`,
          read: false
        });
    }, 15 * 60 * 1000); // 15 minutes later

    console.log(`✅ Ride ${rideId} successfully dispatched to ${driver.name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        driverInfo: {
          name: driver.name,
          phone: driver.phone,
          vehicle: `${driver.vehicle_color} ${driver.vehicle_make} ${driver.vehicle_model}`,
          licensePlate: driver.license_plate,
          rating: driver.rating,
          estimatedArrival: estimatedArrival.toISOString()
        },
        message: 'Driver assigned successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in dispatch-ride function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});