import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriverActionRequest {
  rideId: string;
  action: 'accept' | 'reject' | 'complete' | 'cancel';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { rideId, action } = await req.json() as DriverActionRequest;

    console.log('Driver action:', action, 'for ride:', rideId, 'by user:', user.id);

    // Get driver record
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (driverError || !driver) {
      throw new Error('Driver not found');
    }

    // Get ride
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .select('*')
      .eq('id', rideId)
      .single();

    if (rideError || !ride) {
      throw new Error('Ride not found');
    }

    let newStatus = ride.status;
    let driverStatus = driver.status;

    switch (action) {
      case 'accept':
        newStatus = 'en_route';
        driverStatus = 'busy';
        break;
      case 'reject':
        newStatus = 'pending';
        driverStatus = 'online';
        // Clear driver assignment
        await supabase
          .from('rides')
          .update({
            driver_id: null,
            driver_name: null,
            driver_phone: null,
            driver_rating: null,
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', rideId);
        
        await supabase
          .from('drivers')
          .update({ 
            status: driverStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver.id);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Ride rejected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      case 'complete':
        newStatus = 'completed';
        driverStatus = 'online';
        
        // Update driver earnings and stats
        const earnings = ride.driver_earnings || 0;
        await supabase
          .from('drivers')
          .update({
            status: driverStatus,
            total_rides: driver.total_rides + 1,
            total_earnings: driver.total_earnings + earnings,
            care_coins_balance: driver.care_coins_balance + earnings,
            updated_at: new Date().toISOString()
          })
          .eq('id', driver.id);
        break;
      case 'cancel':
        newStatus = 'cancelled';
        driverStatus = 'online';
        break;
    }

    // Update ride status
    const { error: updateRideError } = await supabase
      .from('rides')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', rideId);

    if (updateRideError) {
      console.error('Error updating ride:', updateRideError);
      throw updateRideError;
    }

    // Update driver status
    if (action !== 'reject') {
      const { error: updateDriverError } = await supabase
        .from('drivers')
        .update({ 
          status: driverStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id);

      if (updateDriverError) {
        console.error('Error updating driver:', updateDriverError);
        throw updateDriverError;
      }
    }

    console.log('Driver action completed successfully');

    return new Response(
      JSON.stringify({ success: true, newStatus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in driver-action function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
