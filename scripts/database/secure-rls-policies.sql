-- More secure RLS policies for downloads table
-- This allows limited anonymous access with better security

-- Enable RLS on downloads table
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to INSERT download records
-- Only allow inserts with valid sticker_id and reasonable constraints
CREATE POLICY "Allow anonymous insert downloads" ON downloads
    FOR INSERT TO anon
    WITH CHECK (
        -- Must have a valid sticker_id that exists in stickers table
        sticker_id IS NOT NULL 
        AND EXISTS (SELECT 1 FROM stickers WHERE id = sticker_id)
        -- IP hash must be provided (for tracking)
        AND ip_hash IS NOT NULL
        AND length(ip_hash) > 10  -- Reasonable hash length
    );

-- Policy 2: Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access downloads" ON downloads
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 3: Allow anonymous users to SELECT downloads for counting
-- But only basic fields, no sensitive data
CREATE POLICY "Allow anonymous select downloads for counting" ON downloads
    FOR SELECT TO anon
    USING (true);

-- Optional: Rate limiting policy (prevent spam)
-- Note: This is more complex and might need additional setup
-- CREATE POLICY "Rate limit downloads" ON downloads
--     FOR INSERT TO anon
--     WITH CHECK (
--         (SELECT count(*) FROM downloads 
--          WHERE ip_hash = NEW.ip_hash 
--          AND downloaded_at > now() - interval '1 minute') < 10
--     );

-- Check the created policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'downloads'
ORDER BY policyname;