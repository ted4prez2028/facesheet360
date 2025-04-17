
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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch menu items from api.data.gov
    const response = await fetch('https://api.data.gov/usfoods/menu-items', {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('USFOODS_API_KEY')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.statusText}`);
    }

    const menuItems = await response.json();

    // Transform and insert menu items into Supabase
    const transformedItems = menuItems.map((item: any) => ({
      id: item.id, // Assuming the API provides an ID
      name: item.name,
      description: item.description,
      category: item.category,
      dietary_info: {
        calories: item.nutritional_info?.calories,
        protein: item.nutritional_info?.protein,
        allergies: item.allergens || [],
        diet_types: item.dietary_restrictions || []
      },
      is_available: true
    }));

    // Clear existing menu items and insert new ones
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', 'placeholder'); // Delete all records

    if (deleteError) {
      throw deleteError;
    }

    const { error: insertError } = await supabase
      .from('menu_items')
      .insert(transformedItems);

    if (insertError) {
      throw insertError;
    }

    // Log success
    console.log(`Successfully synced ${transformedItems.length} menu items`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${transformedItems.length} menu items`,
        data: transformedItems 
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
})
