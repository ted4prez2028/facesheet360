-- Fix the RLS issue by enabling RLS on any public tables that don't have it
-- Check and enable RLS on commonly missed tables

-- Enable RLS on group_calls if it exists and doesn't have RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'group_calls') THEN
        EXECUTE 'ALTER TABLE public.group_calls ENABLE ROW LEVEL SECURITY';
        
        -- Add basic RLS policy for group_calls
        EXECUTE 'CREATE POLICY "Users can view group calls" ON public.group_calls FOR SELECT USING (auth.uid() IS NOT NULL)';
        EXECUTE 'CREATE POLICY "Users can insert group calls" ON public.group_calls FOR INSERT WITH CHECK (auth.uid() IS NOT NULL)';
        EXECUTE 'CREATE POLICY "Users can update group calls" ON public.group_calls FOR UPDATE USING (auth.uid() IS NOT NULL)';
        EXECUTE 'CREATE POLICY "Users can delete group calls" ON public.group_calls FOR DELETE USING (auth.uid() IS NOT NULL)';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- RLS already enabled or policies already exist, continue
        NULL;
END
$$;