import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("🔍 Starting CashApp payment verification");
    
    const { subscriptionId } = await req.json();
    console.log("📋 Verifying subscription:", subscriptionId);

    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subError) {
      console.error("❌ Subscription lookup error:", subError);
      throw new Error("Subscription not found");
    }

    console.log("📊 Subscription found:", subscription.plan_id);

    // Simulate payment verification (in production, you'd integrate with CashApp API)
    // For demo purposes, we'll use a random success rate
    const isPaymentVerified = Math.random() > 0.2; // 80% success rate for demo

    if (isPaymentVerified) {
      console.log("✅ Payment verification successful");
      
      // Calculate subscription end date (30 days from now)
      const subscriptionEnd = new Date();
      subscriptionEnd.setDate(subscriptionEnd.getDate() + 30);

      // Update subscription status
      const { error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: subscriptionEnd.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        console.error("❌ Subscription update error:", updateError);
        throw updateError;
      }

      // Update payment status
      const { error: paymentUpdateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId);

      if (paymentUpdateError) {
        console.error("❌ Payment update error:", paymentUpdateError);
        throw paymentUpdateError;
      }

      console.log("🎉 Subscription activated successfully");
      return new Response(JSON.stringify({
        success: true,
        message: "Payment verified and subscription activated!",
        subscription: {
          id: subscription.id,
          plan_id: subscription.plan_id,
          amount: subscription.amount
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log("❌ Payment verification failed");
      return new Response(JSON.stringify({
        success: false,
        message: "Payment not found or verification failed. Please ensure payment was sent to the correct CashApp handle."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

  } catch (error) {
    console.error("❌ Verification error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});