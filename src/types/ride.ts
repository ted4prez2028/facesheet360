export interface Ride {
  id: string;
  user_id: string;
  patient_id?: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_time: string;
  estimated_arrival?: string;
  actual_pickup_time?: string;
  actual_dropoff_time?: string;
  status: 'requested' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  driver_name?: string;
  vehicle_info?: string;
  created_at?: string;
  updated_at?: string;
}
