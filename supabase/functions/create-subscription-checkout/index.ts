import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    console.log("🚀 Starting subscription checkout process");
    
    const { planId, planName, price, paymentMethod, guestCheckout } = await req.json();
    console.log("📊 Plan details:", { planId, planName, price, paymentMethod, guestCheckout });

    // Get user if not guest checkout
    let user = null;
    if (!guestCheckout) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header provided");
      
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      user = userData.user;
      console.log("👤 User authenticated:", user?.email);
    }

    // Handle CashApp payment
    if (paymentMethod === 'cashapp') {
      console.log("💰 Processing CashApp payment");
      
      // Create pending subscription record
      const subscriptionData = {
        user_id: user?.id || null,
        plan_id: planId,
        amount: price,
        status: 'pending',
        payment_method: 'cashapp',
        payment_id: `cashapp_${Date.now()}`,
        currency: 'USD'
      };

      const { data: subscription, error: subError } = await supabaseClient
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (subError) {
        console.error("❌ Subscription creation error:", subError);
        throw subError;
      }

      // Create pending payment record
      const paymentData = {
        user_id: user?.id || null,
        subscription_id: subscription.id,
        amount: price,
        currency: 'USD',
        payment_method: 'cashapp',
        external_payment_id: subscription.payment_id,
        payment_status: 'pending',
        payment_data: {
          plan_name: planName,
          plan_id: planId
        }
      };

      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert(paymentData);

      if (paymentError) {
        console.error("❌ Payment creation error:", paymentError);
        throw paymentError;
      }

      console.log("✅ CashApp payment setup completed");
      return new Response(JSON.stringify({
        subscriptionId: subscription.id,
        amount: price,
        cashAppHandle: '$mycashdirect2022',
        instructions: `Send $${price} to $mycashdirect2022 for ${planName} subscription. Include reference: ${subscription.id}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle Stripe payment
    if (paymentMethod === 'stripe') {
      console.log("💳 Processing Stripe payment");
      
      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2023-10-16",
      });

      // Check if customer exists for authenticated users
      let customerId;
      if (user?.email) {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }

      // Create checkout session
      const sessionData: any = {
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: planName,
                description: `Healthcare management subscription - ${planName}` 
              },
              unit_amount: Math.round(price * 100),
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/subscription?success=true`,
        cancel_url: `${req.headers.get("origin")}/view-plans?canceled=true`,
        metadata: {
          plan_id: planId,
          plan_name: planName,
        }
      };

      if (customerId) {
        sessionData.customer = customerId;
      } else if (user?.email) {
        sessionData.customer_email = user.email;
      } else {
        // Guest checkout - collect email
        sessionData.customer_creation = 'always';
      }

      const session = await stripe.checkout.sessions.create(sessionData);

      // Create pending subscription record
      const subscriptionData = {
        user_id: user?.id || null,
        plan_id: planId,
        amount: price,
        status: 'pending',
        payment_method: 'stripe',
        payment_id: session.id,
        currency: 'USD'
      };

      const { error: subError } = await supabaseClient
        .from('subscriptions')
        .insert(subscriptionData);

      if (subError) {
        console.error("❌ Subscription creation error:", subError);
        throw subError;
      }

      console.log("✅ Stripe checkout session created:", session.id);
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error("Invalid payment method");

  } catch (error) {
    console.error("❌ Checkout error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});