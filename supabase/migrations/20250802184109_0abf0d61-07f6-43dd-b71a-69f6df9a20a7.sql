-- Add a team member for tdicusmurray to chat with
INSERT INTO public.users (
  user_id,
  email,
  name,
  role,
  organization,
  online_status,
  specialty
) VALUES (
  gen_random_uuid()::text,
  'sarah.johnson@healthcare.com',
  'Dr. Sarah Johnson',
  'doctor',
  'Healthcare Center',
  true,
  'Cardiology'
);