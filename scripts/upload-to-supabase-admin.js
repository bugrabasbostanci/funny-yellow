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
  'happy-face.webp': { name: 'Happy Face', category: 'funny-emoji', tags: ['happy', 'smile', 'positive'] },
  'thumbs-up.webp': { name: 'Thumbs Up', category: 'reactions', tags: ['good', 'approval', 'like'] },
  'crying-laugh.webp': { name: 'Crying Laugh', category: 'memes', tags: ['funny', 'lol', 'tears'] },
  'heart-eyes.webp': { name: 'Heart Eyes', category: 'expressions', tags: ['love', 'heart', 'crush'] },
  'cute-cat.webp': { name: 'Cute Cat', category: 'animals', tags: ['cat', 'cute', 'pet'] },
  'winking-face.webp': { name: 'Winking Face', category: 'funny-emoji', tags: ['wink', 'flirt', 'secret'] },
  'angry-face.webp': { name: 'Angry Face', category: 'reactions', tags: ['angry', 'mad', 'rage'] },
  'shocked-face.webp': { name: 'Shocked Face', category: 'reactions', tags: ['surprised', 'wow', 'shock'] },
  'cool-sunglasses.webp': { name: 'Cool Sunglasses', category: 'expressions', tags: ['cool', 'sunglasses', 'awesome'] },
  'party-hat.webp': { name: 'Party Hat', category: 'celebration', tags: ['party', 'celebration', 'fun'] },
  'tired-face.webp': { name: 'Tired Face', category: 'expressions', tags: ['tired', 'sleepy', 'exhausted'] },
  'money-eyes.webp': { name: 'Money Eyes', category: 'expressions', tags: ['money', 'rich', 'greedy'] },
  'rainbow.webp': { name: 'Rainbow', category: 'nature', tags: ['rainbow', 'colorful', 'weather'] },
  'fire-emoji.webp': { name: 'Fire Emoji', category: 'expressions', tags: ['fire', 'hot', 'lit'] },
  'pizza-slice.webp': { name: 'Pizza Slice', category: 'food', tags: ['pizza', 'food', 'delicious'] },
  'peace-sign.webp': { name: 'Peace Sign', category: 'expressions', tags: ['peace', 'hippie', 'love'] },
  'rocket.webp': { name: 'Rocket', category: 'objects', tags: ['rocket', 'space', 'launch'] },
  'star-eyes.webp': { name: 'Star Eyes', category: 'expressions', tags: ['star', 'amazed', 'starstruck'] },
  'muscle-arm.webp': { name: 'Muscle Arm', category: 'expressions', tags: ['strong', 'muscle', 'power'] },
  'celebration.webp': { name: 'Celebration', category: 'celebration', tags: ['party', 'celebrate', 'happy'] }
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