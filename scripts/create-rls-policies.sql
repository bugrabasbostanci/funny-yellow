-- Create RLS policies for downloads table
-- This allows anonymous users to insert download records for tracking

-- Enable RLS on downloads table (if not already enabled)
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to INSERT download records
CREATE POLICY "Allow anonymous insert downloads" ON downloads
    FOR INSERT TO anon
    WITH CHECK (true);

-- Policy 2: Allow service role to do everything (for admin operations)
CREATE POLICY "Allow service role full access downloads" ON downloads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 3: Allow anonymous users to SELECT their own downloads (optional, for consistency checking)
-- This might be needed if we want to count downloads from frontend
CREATE POLICY "Allow anonymous select downloads" ON downloads
    FOR SELECT TO anon
    USING (true);

-- Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'downloads';

-- Also check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE tablename = 'downloads';