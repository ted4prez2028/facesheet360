
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
        .order('category');
      
      if (error) throw error;
      
      // Transform the data to ensure it matches our MenuItem type
      return (data as any[]).map(item => {
        // Ensure dietary_info is properly structured
        const dietary_info = item.dietary_info ? {
          calories: item.dietary_info.calories || 0,
          protein: item.dietary_info.protein || '0g',
          allergies: Array.isArray(item.dietary_info.allergies) ? item.dietary_info.allergies : [],
          diet_types: Array.isArray(item.dietary_info.diet_types) ? item.dietary_info.diet_types : []
        } : undefined;
        
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          dietary_info,
          is_available: item.is_available ?? true,
        } as MenuItem;
      });
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

      // First create the order
      const { data: order, error: orderError } = await supabase
        .from('food_orders')
        .insert({
          patient_id: orderData.patient_id,
          ordered_by_id: userData.user.id,
          delivery_time: orderData.delivery_time,
          special_instructions: orderData.special_instructions,
          room_number: orderData.room_number,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Then create all order items
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
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodOrders', patientId] });
      toast.success('Food order created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create food order');
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
