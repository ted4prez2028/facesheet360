-- Enable real-time updates for dashboard statistics tables

-- Enable replica identity for real-time updates
ALTER TABLE public.patients REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.call_lights REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.users REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE patients;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE call_lights;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Create a function to get dashboard statistics for better performance
CREATE OR REPLACE FUNCTION public.get_dashboard_statistics(user_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  active_patients_count integer;
  today_appointments_count integer;
  pending_tasks_count integer;
  care_coins_balance integer;
  today_date date;
  tomorrow_date date;
BEGIN
  -- Get current date range
  today_date := CURRENT_DATE;
  tomorrow_date := today_date + interval '1 day';
  
  -- Count active patients
  SELECT COUNT(*) INTO active_patients_count
  FROM public.patients;
  
  -- Count today's appointments
  SELECT COUNT(*) INTO today_appointments_count
  FROM public.appointments
  WHERE appointment_date >= today_date
    AND appointment_date < tomorrow_date
    AND status IN ('scheduled', 'confirmed');
  
  -- Count pending tasks (call lights + tasks)
  SELECT 
    (SELECT COUNT(*) FROM public.call_lights WHERE status = 'active') +
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending')
  INTO pending_tasks_count;
  
  -- Get user's care coins balance
  SELECT COALESCE(care_coins_balance, 0) INTO care_coins_balance
  FROM public.users
  WHERE id = user_id_param;
  
  RETURN jsonb_build_object(
    'activePatients', active_patients_count,
    'todayAppointments', today_appointments_count,
    'pendingTasks', pending_tasks_count,
    'careCoinsEarned', care_coins_balance
  );
END;
$$;