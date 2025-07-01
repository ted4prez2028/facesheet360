import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) throw new Error("User not authenticated");

    const { planId, planName, price, paymentMethod } = await req.json();

    if (paymentMethod === 'cashapp') {
      // For CashApp payments, create a pending subscription and return payment instructions
      const { data: subscription, error: subError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'pending',
          amount: price,
          payment_method: 'cashapp'
        })
        .select()
        .single();

      if (subError) throw subError;

      // Create payment record
      await supabaseClient.from('payments').insert({
        user_id: user.id,
        subscription_id: subscription.id,
        amount: price,
        payment_method: 'cashapp',
        payment_status: 'pending'
      });

      return new Response(JSON.stringify({
        paymentMethod: 'cashapp',
        cashAppHandle: '$mycashdirect2022',
        amount: price,
        subscriptionId: subscription.id,
        instructions: `Send $${price} to $mycashdirect2022 with reference: SUB-${subscription.id.slice(0, 8)}`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Stripe checkout flow
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: planName },
            unit_amount: price * 100, // Convert to cents
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/subscription?cancelled=true`,
      metadata: {
        planId: planId,
        userId: user.id
      }
    });

    // Create pending subscription
    await supabaseClient.from('subscriptions').insert({
      user_id: user.id,
      plan_id: planId,
      status: 'pending',
      amount: price,
      payment_method: 'stripe',
      payment_id: session.id
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});