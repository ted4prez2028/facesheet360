import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FoodOrder, MenuItem, OrderItem } from '@/types/foodOrder';
import { toast } from 'sonner';

export function useFoodOrders(patientId?: string) {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category');
      
      if (error) {
        toast.error('Failed to load menu items');
        throw error;
      }
      
      return data.map((item: any): MenuItem => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category,
        dietary_info: {
          calories: item.dietary_info?.calories,
          protein: item.dietary_info?.protein || '',
          allergies: Array.isArray(item.dietary_info?.allergies) ? item.dietary_info?.allergies : [],
          diet_types: Array.isArray(item.dietary_info?.diet_types) ? item.dietary_info?.diet_types : [],
          kosher: !!item.dietary_info?.kosher,
          halal: !!item.dietary_info?.halal,
          vegan: !!item.dietary_info?.vegan,
          vegetarian: !!item.dietary_info?.vegetarian,
          gluten_free: !!item.dietary_info?.gluten_free,
          dairy_free: !!item.dietary_info?.dairy_free
        },
        is_available: !!item.is_available,
        brand: item.brand || '',
        ingredients: item.ingredients || '',
        serving_size: item.serving_size || '',
        preparation_instructions: item.preparation_instructions || '',
        allergen_warnings: Array.isArray(item.allergen_warnings) ? item.allergen_warnings : [],
        nutrition_facts: item.nutrition_facts || {},
        image_url: item.image_url || '',
        unit_size: item.unit_size || '',
        unit_price: typeof item.unit_price === 'number' ? item.unit_price : 0,
        usfoods_id: item.usfoods_id || ''
      }));
    }
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['foodOrders', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_orders')
        .select(`
          *,
          order_items (
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('patient_id', patientId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!patientId
  });

  const createOrder = useMutation({
    mutationFn: async (orderData: {
      patient_id: string;
      items: { menu_item_id: string; quantity: number; notes?: string }[];
      delivery_time?: string;
      special_instructions?: string;
      room_number?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // First create the order locally
      const { data: order, error: orderError } = await supabase
        .from('food_orders')
        .insert({
          patient_id: orderData.patient_id,
          ordered_by_id: userData.user.id,
          delivery_time: orderData.delivery_time,
          special_instructions: orderData.special_instructions,
          room_number: orderData.room_number,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.items.map(item => ({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            quantity: item.quantity,
            notes: item.notes
          }))
        );

      if (itemsError) throw itemsError;

      // Submit order to USFoods API via edge function
      const usfoodsResponse = await supabase.functions.invoke('usfoods-order', {
        body: JSON.stringify({
          order_id: order.id,
          patient_id: orderData.patient_id,
          items: orderData.items,
          delivery_details: {
            room_number: orderData.room_number,
            special_instructions: orderData.special_instructions
          }
        })
      });

      if (usfoodsResponse.error) {
        // Rollback local order if USFoods submission fails
        await supabase.from('food_orders').delete().eq('id', order.id);
        throw new Error('Failed to submit order to USFoods');
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodOrders', patientId] });
      toast.success('Food order created and submitted to USFoods');
    },
    onError: (error) => {
      toast.error(`Failed to create food order: ${error.message}`);
      console.error('Order creation error:', error);
    }
  });

  return {
    menuItems,
    orders,
    isLoading: isLoadingMenu || isLoadingOrders,
    createOrder
  };
}
