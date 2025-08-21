const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const stickersDir = path.join(__dirname, '../public/stickers/webp');

// Sticker metadata - mapping file names to categories and names
const stickerMetadata = {
  'agent-sticker.webp': { name: 'Secret Agent', category: 'characters', tags: ['agent', 'spy', 'cool', 'sunglasses', 'secret', 'professional'] },
  'angry-walking-sticker.webp': { name: 'Angry Walk', category: 'emotions', tags: ['angry', 'mad', 'walking', 'rage', 'furious', 'storm-off'] },
  'binoculars-sticker.webp': { name: 'Watching', category: 'gestures', tags: ['watching', 'looking', 'binoculars', 'curious', 'spying', 'observing'] },
  'bowing-down-sticker.webp': { name: 'Bowing', category: 'gestures', tags: ['bow', 'respect', 'sorry', 'apologize', 'humble', 'thank-you'] },
  'covering-ear-sticker.webp': { name: 'Cannot Hear', category: 'reactions', tags: ['deaf', 'cannot-hear', 'ignore', 'block', 'cover-ears', 'refuse-listen'] },
  'crazy-sticker.webp': { name: 'Going Crazy', category: 'emotions', tags: ['crazy', 'insane', 'wild', 'excited', 'hyper', 'mad'] },
  'cute-manga-sticker.webp': { name: 'Cute Manga', category: 'emotions', tags: ['cute', 'manga', 'sweet', 'adorable', 'kawaii', 'anime'] },
  'denying-sticker.webp': { name: 'Refusing', category: 'reactions', tags: ['no', 'refuse', 'deny', 'reject', 'negative', 'disagree'] },
  'depressed-sticker.webp': { name: 'Depressed', category: 'emotions', tags: ['sad', 'depressed', 'down', 'blue', 'unhappy', 'melancholy'] },
  'despair-sticker.webp': { name: 'In Despair', category: 'emotions', tags: ['despair', 'hopeless', 'devastated', 'crushed', 'defeated', 'broken'] },
  'eyelid-pulling-sticker.webp': { name: 'Mocking', category: 'gestures', tags: ['mock', 'tease', 'silly', 'childish', 'tongue', 'playful'] },
  'face-palm-sticker.webp': { name: 'Facepalm', category: 'reactions', tags: ['facepalm', 'disappointed', 'frustrated', 'embarrassed', 'annoyed', 'doh'] },
  'feet-up-sticker.webp': { name: 'Relaxing', category: 'gestures', tags: ['relax', 'chill', 'rest', 'comfortable', 'lazy', 'feet-up'] },
  'flower-sticker.webp': { name: 'Flower Gift', category: 'gestures', tags: ['flower', 'gift', 'romantic', 'sweet', 'love', 'present'] },
  'giving-hand-sticker.webp': { name: 'Helping Hand', category: 'gestures', tags: ['help', 'support', 'giving', 'assistance', 'hand', 'offer'] },
  'hand-on-cheek-sticker.webp': { name: 'Thinking', category: 'gestures', tags: ['thinking', 'pondering', 'contemplating', 'wondering', 'curious', 'thoughtful'] },
  'hiding-smile-sticker.webp': { name: 'Shy Smile', category: 'emotions', tags: ['shy', 'bashful', 'cute', 'modest', 'embarrassed', 'sweet'] },
  'hope-sticker.webp': { name: 'Hopeful', category: 'emotions', tags: ['hope', 'optimistic', 'positive', 'bright', 'cheerful', 'hopeful'] },
  'middle-finger-sticker.webp': { name: 'Middle Finger', category: 'gestures', tags: ['rude', 'angry', 'offensive', 'middle-finger', 'mad', 'insult'] },
  'nervous-sticker.webp': { name: 'Nervous', category: 'emotions', tags: ['nervous', 'anxious', 'worried', 'scared', 'uncomfortable', 'fidgety'] },
  'pointing-eyes-sticker.webp': { name: 'Watching You', category: 'gestures', tags: ['watching', 'suspicious', 'pointing', 'alert', 'aware', 'vigilant'] },
  'ponder-sticker.webp': { name: 'Deep Thinking', category: 'emotions', tags: ['thinking', 'ponder', 'deep', 'philosophical', 'contemplating', 'wise'] },
  'poor-sticker.webp': { name: 'Poor Me', category: 'emotions', tags: ['poor', 'sad', 'pity', 'broke', 'unfortunate', 'sympathy'] },
  'refuse-sticker.webp': { name: 'Strong Refuse', category: 'reactions', tags: ['refuse', 'no-way', 'absolutely-not', 'reject', 'strong-no', 'adamant'] },
  'rose-sticker.webp': { name: 'Rose Gift', category: 'gestures', tags: ['rose', 'romantic', 'love', 'flower', 'gift', 'valentine'] },
  'rubbing-belly-sticker.webp': { name: 'Satisfied', category: 'emotions', tags: ['satisfied', 'full', 'content', 'happy', 'pleased', 'belly'] },
  'shinny-smile-sticker.webp': { name: 'Shiny Smile', category: 'emotions', tags: ['happy', 'bright', 'shiny', 'cheerful', 'radiant', 'glowing'] },
  'side-eye-sticker.webp': { name: 'Side Eye', category: 'reactions', tags: ['suspicious', 'skeptical', 'side-eye', 'doubtful', 'judging', 'questioning'] },
  'sly-sticker.webp': { name: 'Sly', category: 'emotions', tags: ['sly', 'sneaky', 'mischievous', 'cunning', 'devious', 'clever'] },
  'small-size-sticker.webp': { name: 'Tiny Me', category: 'emotions', tags: ['small', 'tiny', 'humble', 'insignificant', 'modest', 'little'] },
  'spy-sticker.webp': { name: 'Spy', category: 'characters', tags: ['spy', 'detective', 'investigate', 'secret', 'stealth', 'undercover'] },
  'suspicious-sticker.webp': { name: 'Suspicious', category: 'reactions', tags: ['suspicious', 'doubtful', 'skeptical', 'questioning', 'wary', 'cautious'] },
  'thumos-down-sticker.webp': { name: 'Thumbs Down', category: 'reactions', tags: ['thumbs-down', 'disapproval', 'bad', 'negative', 'dislike', 'reject'] },
  'thump-up-winking-witcker.webp': { name: 'Thumbs Up Wink', category: 'reactions', tags: ['thumbs-up', 'wink', 'approval', 'good', 'positive', 'cool'] },
  'thumps-up-sticker.webp': { name: 'Thumbs Up', category: 'reactions', tags: ['thumbs-up', 'approval', 'good', 'positive', 'like', 'agree'] },
  'touching-nose-sticker.webp': { name: 'Nose Touch', category: 'gestures', tags: ['nose', 'touch', 'shy', 'embarrassed', 'cute', 'bashful'] },
  'villain-sticker.webp': { name: 'Villain', category: 'characters', tags: ['villain', 'evil', 'bad', 'dark', 'menacing', 'antagonist'] },
  'wink-fingers-sticker.webp': { name: 'Finger Guns', category: 'gestures', tags: ['finger-guns', 'cool', 'confident', 'pointing', 'smooth', 'playful'] },
  'wonder-female-sticker.webp': { name: 'Wonder Woman', category: 'characters', tags: ['superhero', 'strong', 'powerful', 'woman', 'hero', 'confident'] },
  'yuck-face-sticker.webp': { name: 'Disgusted', category: 'reactions', tags: ['disgusted', 'yuck', 'gross', 'eww', 'nasty', 'repulsed'] }
};

async function setupStorageBucket() {
  try {
    console.log('🪣 Setting up storage bucket...');
    
    // Check if bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const stickersBucket = buckets?.find(bucket => bucket.name === 'stickers');
    
    if (!stickersBucket) {
      console.log('📦 Creating stickers bucket...');
      const { error: bucketError } = await supabaseAdmin.storage.createBucket('stickers', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/webp', 'image/png', 'image/svg+xml']
      });
      
      if (bucketError) {
        console.error('❌ Failed to create bucket:', bucketError);
        return false;
      }
      console.log('✅ Stickers bucket created successfully!');
    } else {
      console.log('✅ Stickers bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up storage bucket:', error);
    return false;
  }
}

async function uploadSticker(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('stickers')
      .upload(`stickers/${fileName}`, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${fileName}:`, uploadError);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('stickers')
      .getPublicUrl(`stickers/${fileName}`);

    const metadata = stickerMetadata[fileName] || { 
      name: fileName.replace('.webp', ''), 
      category: 'misc', 
      tags: [] 
    };

    // First, check if the sticker already exists
    const { data: existingSticker } = await supabaseAdmin
      .from('stickers')
      .select('id')
      .eq('slug', metadata.name.toLowerCase().replace(/\s+/g, '-'))
      .single();

    if (existingSticker) {
      // Update existing sticker
      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('stickers')
        .update({
          file_url: urlData.publicUrl,
          thumbnail_url: urlData.publicUrl,
          file_size: fileStats.size,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSticker.id)
        .select()
        .single();

      if (dbError) {
        console.error(`❌ Database update failed for ${fileName}:`, dbError);
        return null;
      }

      console.log(`✅ Updated existing record for ${fileName}`);
      return { upload: uploadData, record: dbData, url: urlData.publicUrl };
    } else {
      // Insert new sticker record
      const stickerRecord = {
        name: metadata.name,
        slug: metadata.name.toLowerCase().replace(/\s+/g, '-'),
        category: metadata.category,
        tags: metadata.tags,
        file_url: urlData.publicUrl,
        thumbnail_url: urlData.publicUrl,
        file_size: fileStats.size,
        file_format: 'webp',
        width: 512,
        height: 512,
        download_count: Math.floor(Math.random() * 10000) + 1000
      };

      const { data: dbData, error: dbError } = await supabaseAdmin
        .from('stickers')
        .insert(stickerRecord)
        .select()
        .single();

      if (dbError) {
        console.error(`❌ Database insert failed for ${fileName}:`, dbError);
        return null;
      }

      console.log(`✅ Successfully uploaded and inserted ${fileName}`);
      return { upload: uploadData, record: dbData, url: urlData.publicUrl };
    }

  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error);
    return null;
  }
}

async function uploadAllStickers() {
  try {
    console.log('🚀 Starting Supabase upload process...\n');
    
    // Setup storage bucket
    const bucketSetup = await setupStorageBucket();
    if (!bucketSetup) {
      console.error('❌ Failed to setup storage bucket');
      process.exit(1);
    }
    
    const files = fs.readdirSync(stickersDir);
    const webpFiles = files.filter(file => file.endsWith('.webp'));
    
    console.log(`\nFound ${webpFiles.length} WebP stickers to upload:\n`);
    
    const results = [];
    let successCount = 0;
    let failCount = 0;
    
    for (const fileName of webpFiles) {
      const filePath = path.join(stickersDir, fileName);
      const result = await uploadSticker(filePath, fileName);
      
      if (result) {
        results.push(result);
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n📊 Upload Summary:`);
    console.log(`   ✅ Successful uploads: ${successCount}`);
    console.log(`   ❌ Failed uploads: ${failCount}`);
    console.log(`   📁 Total processed: ${webpFiles.length}`);
    
    if (results.length > 0) {
      console.log(`\n🔗 Sample URLs:`);
      results.slice(0, 3).forEach(result => {
        console.log(`   • ${result.record.name}: ${result.url}`);
      });
    }
    
    console.log('\n✅ Supabase upload process completed!');
    console.log('🎯 Ready to replace mock data with real Supabase integration');
    
  } catch (error) {
    console.error('❌ Error during upload process:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAllStickers();