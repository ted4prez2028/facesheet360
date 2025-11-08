-- Find and add admin role for tdicusmurray@gmail.com
-- This assumes the user exists in auth.users

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'tdicusmurray@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the role was added
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'tdicusmurray@gmail.com';