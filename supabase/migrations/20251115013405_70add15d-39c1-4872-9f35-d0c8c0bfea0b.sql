
-- Ensure RLS is enabled on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the SELECT policy to ensure it works
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON audit_logs;

CREATE POLICY "Allow all authenticated users to view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Ensure the insert policy exists for system logging
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

CREATE POLICY "Allow authenticated users to insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);
