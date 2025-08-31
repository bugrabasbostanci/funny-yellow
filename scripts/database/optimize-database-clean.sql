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
  SELECT 
    (SELECT COUNT(*) FROM stickers) as total_stickers,
    (SELECT COUNT(*) FROM downloads) as total_downloads,
    (SELECT COUNT(DISTINCT unnest(tags)) FROM stickers WHERE tags IS NOT NULL) as unique_tags,
    (SELECT ROUND(AVG(download_count), 2) FROM stickers) as avg_downloads;
$$;

-- PART 3: Create indexes for search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_search_name 
  ON stickers USING gin (to_tsvector('english', name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_tags_gin 
  ON stickers USING gin (tags);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_created_at 
  ON stickers (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_created_tags 
  ON stickers (created_at DESC, tags);

-- PART 4: Create indexes for downloads
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_downloads_sticker_id 
  ON downloads (sticker_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_downloads_created_at 
  ON downloads (downloaded_at DESC);

-- PART 5: Create indexes for pack optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pack_items_pack_id 
  ON sticker_pack_items (pack_id, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pack_items_sticker_id 
  ON sticker_pack_items (sticker_id);

-- PART 6: Run ANALYZE for optimal query planning
ANALYZE stickers;
ANALYZE downloads;
ANALYZE sticker_pack_items;

-- PART 7: Add helpful comments
COMMENT ON FUNCTION get_popular_tags(integer) IS 'Server-side tag aggregation for optimal performance';
COMMENT ON FUNCTION get_sticker_stats() IS 'Efficient statistics calculation for admin dashboard';
COMMENT ON INDEX idx_stickers_search_name IS 'Full-text search optimization for sticker names';
COMMENT ON INDEX idx_stickers_tags_gin IS 'GIN index for fast tag filtering operations';

-- END OF SCRIPT
-- You can now test the functions:
-- SELECT * FROM get_popular_tags(5);
-- SELECT * FROM get_sticker_stats();