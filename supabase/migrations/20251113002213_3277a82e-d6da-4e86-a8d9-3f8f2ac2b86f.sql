-- Grant super admin role to tdicusmurray@gmail.com
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user ID for tdicusmurray@gmail.com
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'tdicusmurray@gmail.com'
  LIMIT 1;

  -- If user exists, ensure they have admin role
  IF target_user_id IS NOT NULL THEN
    -- Insert admin role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Admin role granted to tdicusmurray@gmail.com (user_id: %)', target_user_id;
  ELSE
    RAISE NOTICE 'User tdicusmurray@gmail.com not found in auth.users';
  END IF;
END $$;