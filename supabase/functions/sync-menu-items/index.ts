
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting USFoods menu sync...');

    // Fetch menu items from USFoods API
    const response = await fetch('https://api.usfoods.com/v1/products/menu-items', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('USFOODS_API_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`USFoods API error: ${response.statusText}`);
    }

    const menuItems = await response.json();
    console.log(`Fetched ${menuItems.length} items from USFoods API`);

    // Clear existing menu items
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', 'placeholder');

    if (deleteError) {
      throw deleteError;
    }

    interface USFoodsMenuItem {
      name: string;
      description?: string;
      category?: string;
      nutritionalInfo?: {
        calories?: number;
        protein?: string;
        allergies?: string[];
        dietaryAttributes?: string[];
      };
      allergens?: string[];
      dietaryAttributes?: string[];
      available?: boolean;
      brand?: string;
      ingredients?: string;
      servingSize?: string;
      preparationInstructions?: string;
      allergenWarnings?: string[];
      imageUrl?: string;
      unitSize?: string;
      unitPrice?: number;
      id: string;
    }

    // Transform and insert new menu items
    const transformedItems = menuItems.map((item: USFoodsMenuItem) => ({
      name: item.name,
      description: item.description,
      category: item.category || 'Uncategorized',
      dietary_info: {
        calories: item.nutritionalInfo?.calories,
        protein: item.nutritionalInfo?.protein,
        allergies: item.allergens || [],
        diet_types: item.dietaryAttributes || [],
        kosher: item.dietaryAttributes?.includes('Kosher'),
        halal: item.dietaryAttributes?.includes('Halal'),
        vegan: item.dietaryAttributes?.includes('Vegan'),
        vegetarian: item.dietaryAttributes?.includes('Vegetarian'),
        gluten_free: item.dietaryAttributes?.includes('Gluten Free'),
        dairy_free: item.dietaryAttributes?.includes('Dairy Free')
      },
      is_available: item.available !== false,
      brand: item.brand,
      ingredients: item.ingredients,
      serving_size: item.servingSize,
      preparation_instructions: item.preparationInstructions,
      allergen_warnings: item.allergenWarnings,
      nutrition_facts: item.nutritionalInfo || {},
      image_url: item.imageUrl,
      unit_size: item.unitSize,
      unit_price: item.unitPrice,
      usfoods_id: item.id
    }));

    // Insert in batches of 100 to avoid payload size limits
    const batchSize = 100;
    for (let i = 0; i < transformedItems.length; i += batchSize) {
      const batch = transformedItems.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('menu_items')
        .insert(batch);

      if (insertError) {
        throw insertError;
      }
      console.log(`Inserted batch ${i / batchSize + 1} of ${Math.ceil(transformedItems.length / batchSize)}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${transformedItems.length} menu items`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error syncing menu items:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
