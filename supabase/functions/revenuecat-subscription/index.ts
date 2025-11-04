import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, planId, userId } = await req.json();
    const REVENUECAT_API_KEY = Deno.env.get('REVENUECAT_API_KEY');

    if (!REVENUECAT_API_KEY) {
      throw new Error('REVENUECAT_API_KEY not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'create': {
        // Create subscription with RevenueCat
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_user_id: userId,
            product_id: planId,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`RevenueCat API error: ${error}`);
        }

        const data = await response.json();

        // Update user subscription status in Supabase
        await supabaseClient
          .from('users')
          .update({ 
            subscription_status: 'active',
            subscription_plan: planId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'check': {
        // Check subscription status
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to check subscription');
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'cancel': {
        // Cancel subscription
        const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}/entitlements`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${REVENUECAT_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to cancel subscription');
        }

        // Update user subscription status
        await supabaseClient
          .from('users')
          .update({ 
            subscription_status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
