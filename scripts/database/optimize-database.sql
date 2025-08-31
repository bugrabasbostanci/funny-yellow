-- Database Optimization Script for Funny Yellow Sticker Platform
-- Run this script in your Supabase SQL Editor for optimal performance

-- 1. Create server-side tag aggregation function (major performance boost)
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

-- 2. Optimize indexes for common queries
-- Index for search queries (name + tags)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_search_name 
  ON stickers USING gin (to_tsvector('english', name));

-- Index for tag filtering (array contains operations)  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_tags_gin 
  ON stickers USING gin (tags);

-- Index for created_at ordering (pagination)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_created_at 
  ON stickers (created_at DESC);

-- Composite index for filtered pagination
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stickers_created_tags 
  ON stickers (created_at DESC, tags);

-- 3. Download tracking optimizations
-- Index for download tracking queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_downloads_sticker_id 
  ON downloads (sticker_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_downloads_created_at 
  ON downloads (downloaded_at DESC);

-- 4. Statistics aggregation function
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

-- 5. Optimize sticker pack queries
-- Index for pack items
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pack_items_pack_id 
  ON sticker_pack_items (pack_id, display_order);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pack_items_sticker_id 
  ON sticker_pack_items (sticker_id);

-- 6. Create materialized view for popular tags (optional, for high-traffic sites)
-- Uncomment if you need ultra-fast tag loading
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_tags_mv AS
  SELECT 
    unnest(tags) as tag,
    COUNT(*) as count
  FROM stickers 
  WHERE tags IS NOT NULL AND array_length(tags, 1) > 0
  GROUP BY unnest(tags)
  ORDER BY count DESC
  LIMIT 20;

-- Refresh the materialized view periodically (set up a cron job)
-- SELECT cron.schedule('refresh-popular-tags', '*/10 * * * *', 'REFRESH MATERIALIZED VIEW popular_tags_mv;');
*/

-- 7. Query performance analysis (run these to check effectiveness)
-- Check query performance
-- EXPLAIN ANALYZE SELECT * FROM stickers WHERE tags @> ARRAY['funny'] ORDER BY created_at DESC LIMIT 24;
-- EXPLAIN ANALYZE SELECT unnest(tags) as tag, COUNT(*) FROM stickers GROUP BY unnest(tags) ORDER BY count DESC LIMIT 10;

-- 8. Database maintenance recommendations
-- Run ANALYZE after creating indexes
ANALYZE stickers;
ANALYZE downloads;
ANALYZE sticker_pack_items;

-- Comments for monitoring
COMMENT ON FUNCTION get_popular_tags(integer) IS 'Server-side tag aggregation for optimal performance - replaces client-side processing';
COMMENT ON FUNCTION get_sticker_stats() IS 'Efficient statistics calculation for admin dashboard';
COMMENT ON INDEX idx_stickers_search_name IS 'Full-text search optimization for sticker names';
COMMENT ON INDEX idx_stickers_tags_gin IS 'GIN index for fast tag filtering and contains operations';