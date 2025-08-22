const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const stickersDir = path.join(__dirname, '../public/stickers/webp');

// Load metadata from generated JSON file
function loadStickerMetadata() {
  try {
    const metadataPath = path.join(__dirname, 'sticker-metadata.json');
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      console.log(`📋 Loaded metadata for ${metadata.length} stickers`);
      
      // Convert array to filename-keyed object for compatibility
      const keyedMetadata = {};
      metadata.forEach(sticker => {
        const filename = path.basename(sticker.file_url).replace('.png', '.webp');
        keyedMetadata[filename] = {
          name: sticker.name,
          tags: sticker.tags
        };
      });
      
      return keyedMetadata;
    } else {
      console.warn('⚠️ No metadata file found, using fallback');
      return {};
    }
  } catch (error) {
    console.error('❌ Error loading metadata:', error);
    return {};
  }
}

const stickerMetadata = loadStickerMetadata();

async function uploadSticker(filePath, fileName) {
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const fileStats = fs.statSync(filePath);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('stickers')
      .upload(`stickers/${fileName}`, fileBuffer, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${fileName}:`, uploadError.message);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('stickers')
      .getPublicUrl(`stickers/${fileName}`);

    const metadata = stickerMetadata[fileName] || { 
      name: fileName.replace('.webp', ''), 
      tags: ['emoji', 'reaction'] 
    };

    // Insert sticker record into database
    const stickerRecord = {
      name: metadata.name,
      slug: metadata.name.toLowerCase().replace(/\s+/g, '-'),
      tags: metadata.tags,
      file_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl, // Same as file_url for MVP
      file_size: fileStats.size,
      file_format: 'webp',
      width: 512,
      height: 512,
      download_count: 0 // Start with 0 downloads
    };

    const { data: dbData, error: dbError } = await supabase
      .from('stickers')
      .insert(stickerRecord)
      .select()
      .single();

    if (dbError) {
      console.error(`❌ Database insert failed for ${fileName}:`, dbError.message);
      return null;
    }

    console.log(`✅ Successfully uploaded and inserted ${fileName}`);
    return {
      upload: uploadData,
      record: dbData,
      url: urlData.publicUrl
    };

  } catch (error) {
    console.error(`❌ Error processing ${fileName}:`, error.message);
    return null;
  }
}

async function uploadAllStickers() {
  try {
    console.log('🚀 Starting Supabase upload process...\n');
    
    // Check if bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const stickersBucket = buckets?.find(bucket => bucket.name === 'stickers');
    
    if (!stickersBucket) {
      console.log('📦 Creating stickers bucket...');
      const { error: bucketError } = await supabase.storage.createBucket('stickers', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/webp', 'image/png', 'image/svg+xml']
      });
      
      if (bucketError) {
        console.error('❌ Failed to create bucket:', bucketError.message);
        process.exit(1);
      }
      console.log('✅ Stickers bucket created successfully!');
    }
    
    const files = fs.readdirSync(stickersDir);
    const webpFiles = files.filter(file => file.endsWith('.webp'));
    
    console.log(`Found ${webpFiles.length} WebP stickers to upload:\n`);
    
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
      await new Promise(resolve => setTimeout(resolve, 100));
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
    
  } catch (error) {
    console.error('❌ Error during upload process:', error);
    process.exit(1);
  }
}

// Run the upload
uploadAllStickers();