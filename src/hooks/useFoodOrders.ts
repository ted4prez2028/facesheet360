
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FoodOrder, MenuItem } from '@/types/foodOrder';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const MOCK_MENU_ITEMS: MenuItem[] = [
  { 
    id: '1', 
    name: 'Grilled Chicken Breast', 
    category: 'Main Course', 
    description: 'Lean grilled chicken breast with herbs',
    dietary_info: {
      calories: 250,
      protein: '40g',
      allergies: [],
      diet_types: ['gluten_free', 'dairy_free'],
      gluten_free: true,
      dairy_free: true
    },
    is_available: true,
    unit_price: 12.99
  },
  { 
    id: '2', 
    name: 'Caesar Salad', 
    category: 'Salad', 
    description: 'Fresh romaine with house caesar dressing',
    dietary_info: {
      calories: 180,
      protein: '8g',
      allergies: ['dairy', 'eggs'],
      diet_types: ['vegetarian'],
      vegetarian: true
    },
    is_available: true,
    unit_price: 8.99
  },
  { 
    id: '3', 
    name: 'Vegetable Soup', 
    category: 'Soup', 
    description: 'Hearty mixed vegetable soup',
    dietary_info: {
      calories: 120,
      protein: '4g',
      allergies: [],
      diet_types: ['vegan', 'gluten_free'],
      vegan: true,
      gluten_free: true
    },
    is_available: true,
    unit_price: 6.99
  },
  { 
    id: '4', 
    name: 'Salmon Fillet', 
    category: 'Main Course', 
    description: 'Fresh Atlantic salmon with lemon',
    dietary_info: {
      calories: 320,
      protein: '38g',
      allergies: ['fish'],
      diet_types: ['gluten_free', 'dairy_free'],
      gluten_free: true,
      dairy_free: true
    },
    is_available: true,
    unit_price: 16.99
  },
  { 
    id: '5', 
    name: 'Pasta Primavera', 
    category: 'Main Course', 
    description: 'Whole wheat pasta with seasonal vegetables',
    dietary_info: {
      calories: 380,
      protein: '14g',
      allergies: ['gluten'],
      diet_types: ['vegetarian'],
      vegetarian: true
    },
    is_available: true,
    unit_price: 11.99
  },
  { 
    id: '6', 
    name: 'Fresh Fruit Bowl', 
    category: 'Dessert', 
    description: 'Seasonal fresh fruit selection',
    dietary_info: {
      calories: 90,
      protein: '2g',
      allergies: [],
      diet_types: ['vegan', 'gluten_free'],
      vegan: true,
      gluten_free: true
    },
    is_available: true,
    unit_price: 5.99
  },
  { 
    id: '7', 
    name: 'Turkey Sandwich', 
    category: 'Sandwich', 
    description: 'Roasted turkey on whole grain bread',
    dietary_info: {
      calories: 340,
      protein: '28g',
      allergies: ['gluten'],
      diet_types: ['dairy_free'],
      dairy_free: true
    },
    is_available: true,
    unit_price: 9.99
  },
  { 
    id: '8', 
    name: 'Minestrone Soup', 
    category: 'Soup', 
    description: 'Italian vegetable and bean soup',
    dietary_info: {
      calories: 150,
      protein: '7g',
      allergies: [],
      diet_types: ['vegan'],
      vegan: true
    },
    is_available: true,
    unit_price: 7.99
  },
  { 
    id: '9', 
    name: 'Quinoa Bowl', 
    category: 'Bowl', 
    description: 'Quinoa with roasted vegetables and tahini',
    dietary_info: {
      calories: 280,
      protein: '12g',
      allergies: ['sesame'],
      diet_types: ['vegan', 'gluten_free'],
      vegan: true,
      gluten_free: true
    },
    is_available: true,
    unit_price: 10.99
  },
  { 
    id: '10', 
    name: 'Chicken Noodle Soup', 
    category: 'Soup', 
    description: 'Classic chicken noodle soup',
    dietary_info: {
      calories: 160,
      protein: '12g',
      allergies: ['gluten'],
      diet_types: ['dairy_free'],
      dairy_free: true
    },
    is_available: true,
    unit_price: 7.99
  }
];

export function useFoodOrders(patientId?: string) {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      return MOCK_MENU_ITEMS;
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
