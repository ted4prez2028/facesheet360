
-- Update the correct user to admin role
UPDATE public.profiles 
SET role = 'admin', name = 'Admin Doctor'
WHERE id = '4b33f4a0-024a-4adb-9bc1-f1e4acaeabfa';
