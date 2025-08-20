-- Funny Yellow MVP Database Schema
-- Based on MVP documentation requirements

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stickers table
CREATE TABLE public.stickers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[], -- PostgreSQL array for tags
    file_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    file_format VARCHAR(10) NOT NULL DEFAULT 'webp',
    width INTEGER NOT NULL DEFAULT 512,
    height INTEGER NOT NULL DEFAULT 512,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Downloads tracking table
CREATE TABLE public.downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sticker_id UUID REFERENCES public.stickers(id) ON DELETE CASCADE,
    ip_hash VARCHAR(64) NOT NULL, -- Hashed IP for privacy
    user_agent TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_stickers_category ON public.stickers(category);
CREATE INDEX idx_stickers_tags ON public.stickers USING GIN(tags);
CREATE INDEX idx_stickers_created_at ON public.stickers(created_at DESC);
CREATE INDEX idx_downloads_sticker_id ON public.downloads(sticker_id);
CREATE INDEX idx_downloads_downloaded_at ON public.downloads(downloaded_at DESC);

-- Function to update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.stickers 
    SET download_count = download_count + 1 
    WHERE id = NEW.sticker_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update download count
CREATE TRIGGER trigger_update_download_count
    AFTER INSERT ON public.downloads
    FOR EACH ROW
    EXECUTE FUNCTION update_download_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_stickers_updated_at
    BEFORE UPDATE ON public.stickers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies - keeping it simple for MVP
ALTER TABLE public.stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Allow public read access to stickers
CREATE POLICY "Allow public read access to stickers" ON public.stickers
    FOR SELECT USING (true);

-- Allow public insert to downloads (for tracking)
CREATE POLICY "Allow public insert to downloads" ON public.downloads
    FOR INSERT WITH CHECK (true);

-- Sample categories for MVP
INSERT INTO public.stickers (name, slug, category, tags, file_url, thumbnail_url, file_size, file_format, width, height) VALUES 
('Laughing Face', 'laughing-face', 'funny-emoji', ARRAY['happy', 'laugh', 'emoji'], '', '', 0, 'webp', 512, 512),
('Thumbs Up', 'thumbs-up', 'reactions', ARRAY['approval', 'good', 'reaction'], '', '', 0, 'webp', 512, 512),
('Crying Laughing', 'crying-laughing', 'memes', ARRAY['funny', 'lol', 'meme'], '', '', 0, 'webp', 512, 512),
('Heart Eyes', 'heart-eyes', 'expressions', ARRAY['love', 'heart', 'emoji'], '', '', 0, 'webp', 512, 512),
('Cute Cat', 'cute-cat', 'animals', ARRAY['cat', 'cute', 'animal'], '', '', 0, 'webp', 512, 512)
ON CONFLICT (slug) DO NOTHING;