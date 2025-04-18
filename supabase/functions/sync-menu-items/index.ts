
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch menu items from USFoods API
    const response = await fetch('https://api.usfoods.com/v1/menu-items', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('USFOODS_API_KEY')}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`USFoods API error: ${response.statusText}`)
    }

    const menuItems = await response.json()

    // Format menu items for our database
    const formattedItems = menuItems.map((item: any) => ({
      name: item.name,
      description: item.description,
      category: item.category,
      dietary_info: {
        calories: item.nutritionalInfo?.calories,
        protein: item.nutritionalInfo?.protein,
        allergies: item.allergens || [],
        diet_types: item.dietaryTypes || []
      },
      is_available: true,
      brand: item.brand,
      ingredients: item.ingredients,
      serving_size: item.servingSize,
      preparation_instructions: item.preparationInstructions,
      allergen_warnings: item.allergenWarnings,
      nutrition_facts: item.nutritionFacts,
      image_url: item.imageUrl,
      unit_size: item.unitSize,
      unit_price: item.unitPrice,
      usfoods_id: item.id
    }))

    // Use upsert to update existing items or insert new ones
    const { error } = await supabase
      .from('menu_items')
      .upsert(formattedItems, {
        onConflict: 'usfoods_id'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${formattedItems.length} menu items` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
