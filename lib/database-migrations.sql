-- Pack Management Database Schema
-- Run these commands in Supabase SQL Editor

-- Create sticker_packs table
CREATE TABLE IF NOT EXISTS sticker_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  character VARCHAR(100),
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sticker_pack_items table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS sticker_pack_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES sticker_packs(id) ON DELETE CASCADE,
  sticker_id UUID REFERENCES stickers(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pack_id, sticker_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sticker_pack_items_pack_id ON sticker_pack_items(pack_id);
CREATE INDEX IF NOT EXISTS idx_sticker_pack_items_sticker_id ON sticker_pack_items(sticker_id);
CREATE INDEX IF NOT EXISTS idx_sticker_packs_active ON sticker_packs(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE sticker_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_pack_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read for everyone, write for admin)
CREATE POLICY "Allow public read access" ON sticker_packs FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON sticker_pack_items FOR SELECT USING (true);

-- Add admin policies (you'll need to customize based on your auth setup)
-- CREATE POLICY "Allow admin full access" ON sticker_packs FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Allow admin full access" ON sticker_pack_items FOR ALL USING (auth.role() = 'admin');

-- For now, allow all operations (customize based on your auth setup)
CREATE POLICY "Allow all operations for now" ON sticker_packs FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON sticker_pack_items FOR ALL USING (true);

-- Insert initial pack data
INSERT INTO sticker_packs (name, description, character, thumbnail_url, display_order) VALUES
('Kermit Collection', 'Iconic Kermit the Frog memes and reactions', 'Kermit', '/stickers/source/kermit-sitting.png', 1),
('Pocoyo Adventures', 'Cute and expressive Pocoyo character stickers', 'Pocoyo', '/stickers/source/pocoyo-sitting-happy-sticker.png', 2),
('Shrek Memes', 'Hilarious Shrek reaction stickers', 'Shrek', '/stickers/source/shrek-funny.png', 3),
('Yellow Emoji Collection', 'Classic yellow emoji reactions and expressions', 'Emoji', '/stickers/source/15.png', 4),
('Reaction Collection', 'Perfect reactions for every conversation', 'Various', '/stickers/source/face-palm-sticker.png', 5),
('Animal Friends', 'Cute animal stickers including cats and monkeys', 'Animals', '/stickers/source/smoking-cat-sticker.png', 6);