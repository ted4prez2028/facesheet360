import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookRideRequest {
  userId: string;
  pickupLocation: string;
  dropoffLocation: string;
  rideType: string;
  patientId?: string;
  scheduledTime?: string;
  estimatedCost: number;
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
      userId,
      pickupLocation,
      dropoffLocation,
      rideType,
      patientId,
      scheduledTime,
      estimatedCost
    }: BookRideRequest = await req.json();

    console.log(`🚗 Booking ride for user ${userId} from ${pickupLocation} to ${dropoffLocation}`);

    // Check user's CareCoin balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('care_coins_balance, name, email')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    if (userData.care_coins_balance < estimatedCost) {
      throw new Error('Insufficient CareCoins balance');
    }

    // Create ride record
    const { data: ride, error: rideError } = await supabase
      .from('rides')
      .insert({
        user_id: userId,
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        ride_type: rideType,
        patient_id: patientId,
        scheduled_time: scheduledTime,
        estimated_cost_carecoins: estimatedCost,
        status: 'pending',
        estimated_arrival_time: scheduledTime || new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now if not scheduled
      })
      .select()
      .single();

    if (rideError) {
      throw rideError;
    }

    console.log(`✅ Ride created with ID: ${ride.id}`);

    // Deduct CareCoins (hold them until ride completion)
    const { error: balanceError } = await supabase
      .from('users')
      .update({ care_coins_balance: userData.care_coins_balance - estimatedCost })
      .eq('id', userId);

    if (balanceError) {
      // Rollback ride creation if balance update fails
      await supabase.from('rides').delete().eq('id', ride.id);
      throw balanceError;
    }

    // Create CareCoin transaction record
    await supabase
      .from('care_coins_transactions')
      .insert({
        from_user_id: userId,
        amount: estimatedCost,
        transaction_type: 'spent',
        description: `Ride booking: ${rideType.replace('_', ' ')} - ${pickupLocation} to ${dropoffLocation}`,
        reward_category: 'transportation',
        metadata: {
          ride_id: ride.id,
          ride_type: rideType,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation
        }
      });

    // Send notification to ride dispatch system
    await supabase.functions.invoke('dispatch-ride', {
      body: {
        rideId: ride.id,
        pickupLocation,
        dropoffLocation,
        rideType,
        estimatedCost,
        userInfo: {
          name: userData.name,
          email: userData.email
        }
      }
    });

    // Send notification to user about ride booking
    if (patientId) {
      // If it's for a patient, notify the patient
      await supabase.functions.invoke('send-notifications', {
        body: {
          patientId: patientId,
          message: `A ride has been booked for you from ${pickupLocation} to ${dropoffLocation}. Estimated cost: ${estimatedCost} CareCoins.`,
          subject: 'Ride Booking Confirmation',
          type: 'ride_notification'
        }
      });
    }

    // Create in-app notification for the user who booked
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'ride_notification',
        title: 'Ride Booked Successfully',
        message: `Your ride from ${pickupLocation} to ${dropoffLocation} has been booked. We'll notify you when a driver is assigned.`,
        read: false
      });

    console.log(`🎉 Ride booking completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rideId: ride.id,
        estimatedCost,
        message: 'Ride booked successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in book-ride function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});