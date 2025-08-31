-- Database Optimization Script for Funny Yellow Sticker Platform
-- Run this script in your Supabase SQL Editor for optimal performance
-- WARNING: Run in parts if you encounter syntax errors

-- PART 1: Create server-side tag aggregation function
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count integer DEFAULT 10)
RETURNS TABLE(tag text, count bigint)
LANGUAGE sql
AS $$
  SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
  FROM stickers 
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  GROUP BY unnest(tags)
  ORDER BY count DESC
  LIMIT limit_count;
$$;

-- PART 2: Create statistics function  
CREATE OR REPLACE FUNCTION get_sticker_stats()
RETURNS TABLE(
  total_stickers bigint,
  total_downloads bigint,
  unique_tags bigint,
  avg_downloads numeric
)
LANGUAGE sql
AS $$
  WITH tag_counts AS (
    SELECT COUNT(DISTINCT tag) as unique_count
    FROM (
      SELECT unnest(tags) as tag 
      FROM stickers 
      WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
    ) t
  )
  SELECT 
    (SELECT COUNT(*) FROM stickers) as total_stickers,
    (SELECT COUNT(*) FROM downloads) as total_downloads,
    (SELECT unique_count FROM tag_counts) as unique_tags,
    (SELECT ROUND(AVG(download_count), 2) FROM stickers) as avg_downloads;
$$;

-- PART 3: Create indexes for search optimization
-- NOTE: Run these ONE BY ONE in separate queries (not in transaction block)
-- Copy-paste each CREATE INDEX command separately in Supabase SQL Editor

-- Index 1: Full-text search on sticker names
CREATE INDEX IF NOT EXISTS idx_stickers_search_name ON stickers USING gin (to_tsvector('english', name));

-- Index 2: GIN index for tag array operations  
CREATE INDEX IF NOT EXISTS idx_stickers_tags_gin ON stickers USING gin (tags);

-- Index 3: Ordering by creation date (most common sort)
CREATE INDEX IF NOT EXISTS idx_stickers_created_at ON stickers (created_at DESC);

-- Index 4: Composite index for filtered pagination
CREATE INDEX IF NOT EXISTS idx_stickers_created_tags ON stickers (created_at DESC, tags);

-- PART 4: Create indexes for downloads (run these separately too)
-- Index 5: Download tracking lookup
CREATE INDEX IF NOT EXISTS idx_downloads_sticker_id ON downloads (sticker_id);

-- Index 6: Download date sorting
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads (downloaded_at DESC);

-- PART 5: Create indexes for pack optimization (run separately)
-- Index 7: Pack items lookup with ordering
CREATE INDEX IF NOT EXISTS idx_pack_items_pack_id ON sticker_pack_items (pack_id, display_order);

-- Index 8: Reverse lookup from sticker to packs
CREATE INDEX IF NOT EXISTS idx_pack_items_sticker_id ON sticker_pack_items (sticker_id);

-- PART 6: Run ANALYZE for optimal query planning
ANALYZE stickers;

ANALYZE downloads;

ANALYZE sticker_pack_items;

-- PART 7: Add helpful comments
COMMENT ON FUNCTION get_popular_tags(integer) IS 'Server-side tag aggregation for optimal performance';

COMMENT ON FUNCTION get_sticker_stats () IS 'Efficient statistics calculation for admin dashboard';

COMMENT ON INDEX idx_stickers_search_name IS 'Full-text search optimization for sticker names';

COMMENT ON INDEX idx_stickers_tags_gin IS 'GIN index for fast tag filtering operations';

-- END OF SCRIPT
-- You can now test the functions:
-- SELECT * FROM get_popular_tags(5);
-- SELECT * FROM get_sticker_stats();