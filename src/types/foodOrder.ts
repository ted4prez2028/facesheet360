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
    kosher?: boolean;
    halal?: boolean;
    vegan?: boolean;
    vegetarian?: boolean;
    gluten_free?: boolean;
    dairy_free?: boolean;
  };
  is_available: boolean;
  brand?: string;
  ingredients?: string;
  serving_size?: string;
  preparation_instructions?: string;
  allergen_warnings?: string[];
  nutrition_facts?: Record<string, any>;
  image_url?: string;
  unit_size?: string;
  unit_price?: number;
  usfoods_id?: string;
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
