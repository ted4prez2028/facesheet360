
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      order_id, 
      patient_id, 
      items, 
      delivery_details 
    } = await req.json()

    // Prepare order for USFoods API
    const usfoodsOrderPayload = {
      customer_id: patient_id,
      items: items.map(item => ({
        item_id: item.menu_item_id,
        quantity: item.quantity,
        special_instructions: item.notes
      })),
      delivery_time: new Date().toISOString(),
      ...delivery_details
    }

    // Make API call to USFoods (replace with actual USFoods API endpoint)
    const response = await fetch('https://api.data.go/usfoods/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('USFOODS_API_KEY')}`
      },
      body: JSON.stringify(usfoodsOrderPayload)
    })

    const orderResult = await response.json()

    // Update local order with USFoods tracking info
    const { error } = await supabase
      .from('food_orders')
      .update({
        status: 'submitted_to_usfoods',
        usfoods_order_id: orderResult.order_id,
        usfoods_tracking_info: orderResult
      })
      .eq('id', order_id)

    if (error) throw error

    return new Response(JSON.stringify(orderResult), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 200
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500
    })
  }
})
