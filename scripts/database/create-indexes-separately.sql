-- Create Database Indexes for Funny Yellow - Run Each Query Separately
-- IMPORTANT: Copy and paste EACH query separately in Supabase SQL Editor
-- Do NOT run this entire file at once!

-- ========================================
-- QUERY 1: Full-text search optimization
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stickers_search_name 
ON stickers USING gin (to_tsvector('english', name));

-- ========================================
-- QUERY 2: Tag array operations (most important!)
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stickers_tags_gin 
ON stickers USING gin (tags);

-- ========================================
-- QUERY 3: Creation date ordering
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stickers_created_at 
ON stickers (created_at DESC);

-- ========================================
-- QUERY 4: Composite index for filtered pagination
-- ========================================
CREATE INDEX IF NOT EXISTS idx_stickers_created_tags 
ON stickers (created_at DESC, tags);

-- ========================================
-- QUERY 5: Download tracking
-- ========================================
CREATE INDEX IF NOT EXISTS idx_downloads_sticker_id 
ON downloads (sticker_id);

-- ========================================
-- QUERY 6: Download date sorting
-- ========================================
CREATE INDEX IF NOT EXISTS idx_downloads_created_at 
ON downloads (downloaded_at DESC);

-- ========================================
-- QUERY 7: Pack items with ordering
-- ========================================
CREATE INDEX IF NOT EXISTS idx_pack_items_pack_id 
ON sticker_pack_items (pack_id, display_order);

-- ========================================
-- QUERY 8: Reverse sticker-to-packs lookup
-- ========================================
CREATE INDEX IF NOT EXISTS idx_pack_items_sticker_id 
ON sticker_pack_items (sticker_id);

-- ========================================
-- QUERY 9: Update statistics (run after all indexes)
-- ========================================
ANALYZE stickers;

-- ========================================
-- QUERY 10: Update download statistics
-- ========================================
ANALYZE downloads;

-- ========================================
-- QUERY 11: Update pack statistics
-- ========================================
ANALYZE sticker_pack_items;

-- END - All indexes should now be created!
-- You can verify with: \d+ stickers (in psql) or check the indexes tab in Supabase