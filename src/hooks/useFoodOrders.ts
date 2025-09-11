
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FoodOrder, MenuItem } from '@/types/foodOrder';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function useFoodOrders(patientId?: string) {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      // Mock menu items since table doesn't exist
      return [
        { id: '1', name: 'Grilled Chicken', category: 'Main Course', description: 'Healthy grilled chicken breast', is_available: true },
        { id: '2', name: 'Caesar Salad', category: 'Salad', description: 'Fresh romaine lettuce with caesar dressing', is_available: true },
        { id: '3', name: 'Vegetable Soup', category: 'Soup', description: 'Hearty vegetable soup', is_available: true }
      ];
    }
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['foodOrders', patientId],
    queryFn: async () => {
      // Mock data since food_orders table doesn't exist
      return [];
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
      // Mock implementation since database tables don't exist
      const mockOrder = {
        id: `order-${Date.now()}`,
        patient_id: orderData.patient_id,
        status: 'pending',
        items: orderData.items,
        delivery_time: orderData.delivery_time,
        special_instructions: orderData.special_instructions,
        room_number: orderData.room_number,
        created_at: new Date().toISOString()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return mockOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foodOrders', patientId] });
      toast.success('Food order created successfully');
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
