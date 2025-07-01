
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FoodOrder, MenuItem, OrderItem } from '@/types/foodOrder';
import { toast } from 'sonner';

interface DbMenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  dietary_info?: {
    calories?: number;
    protein?: string;
    allergies?: string[];
    diet_types?: string[];
    kosher?: boolean;
    halal?: boolean;
    vegan?: boolean;
    vegetarian?: boolean;
    gluten_free?: boolean;
    dairy_free?: boolean;
  };
  is_available?: boolean;
  brand?: string;
  ingredients?: string;
  serving_size?: string;
  preparation_instructions?: string;
  allergen_warnings?: string[];
  nutrition_facts?: Record<string, unknown>;
  image_url?: string;
  unit_size?: string;
  unit_price?: number;
  usfoods_id?: string;
}

export function useFoodOrders(patientId?: string) {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menuItems'],
    queryFn: async (): Promise<MenuItem[]> => {
      // Mock data since menu_items table doesn't exist
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Grilled Chicken Breast',
          description: 'Lean protein with herbs and spices',
          category: 'Main Course',
          dietary_info: {
            calories: 250,
            protein: '30g',
            allergies: [],
            diet_types: ['low-fat', 'high-protein'],
            kosher: false,
            halal: true,
            vegan: false,
            vegetarian: false,
            gluten_free: true,
            dairy_free: true
          },
          is_available: true,
          brand: 'Hospital Kitchen',
          ingredients: 'Chicken breast, herbs, spices',
          serving_size: '6 oz',
          preparation_instructions: 'Grilled to perfection',
          allergen_warnings: [],
          nutrition_facts: {},
          image_url: '',
          unit_size: '1 serving',
          unit_price: 12.99,
          usfoods_id: 'USF001'
        },
        {
          id: '2',
          name: 'Vegetable Soup',
          description: 'Fresh mixed vegetables in clear broth',
          category: 'Soup',
          dietary_info: {
            calories: 80,
            protein: '3g',
            allergies: [],
            diet_types: ['vegetarian', 'vegan', 'low-calorie'],
            kosher: true,
            halal: true,
            vegan: true,
            vegetarian: true,
            gluten_free: true,
            dairy_free: true
          },
          is_available: true,
          brand: 'Hospital Kitchen',
          ingredients: 'Mixed vegetables, vegetable broth',
          serving_size: '8 oz',
          preparation_instructions: 'Simmered fresh daily',
          allergen_warnings: [],
          nutrition_facts: {},
          image_url: '',
          unit_size: '1 cup',
          unit_price: 4.99,
          usfoods_id: 'USF002'
        }
      ];
      
      return mockMenuItems;
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
