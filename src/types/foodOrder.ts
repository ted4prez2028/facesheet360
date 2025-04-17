
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: string;
  dietary_info?: {
    calories: number;
    protein: string;
    allergies: string[];
    diet_types: string[];
  };
  is_available: boolean;
}

export interface FoodOrder {
  id: string;
  patient_id: string;
  ordered_by_id: string;
  status: 'pending' | 'approved' | 'preparing' | 'delivered' | 'cancelled';
  delivery_time?: string;
  special_instructions?: string;
  room_number?: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  notes?: string;
}

export interface DietaryRestrictions {
  id: string;
  patient_id: string;
  restrictions: {
    allergies?: string[];
    diet_types?: string[];
    other?: string[];
  };
  notes?: string;
}
