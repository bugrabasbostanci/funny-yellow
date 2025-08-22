-- Migration: Remove category column from stickers table
-- This script removes the category column and converts category-based filtering to tag-based

-- Drop the category index first
DROP INDEX IF EXISTS idx_stickers_category;

-- Remove the category column from stickers table
ALTER TABLE public.stickers DROP COLUMN IF EXISTS category;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stickers' 
AND table_schema = 'public';