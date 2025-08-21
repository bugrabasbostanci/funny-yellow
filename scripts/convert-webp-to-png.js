const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function convertWebPToPNG() {
  try {
    console.log('🚀 Starting WebP to PNG conversion for WhatsApp Web compatibility...\n');

    // Get all stickers from database
    const { data: stickers, error: fetchError } = await supabase
      .from('stickers')
      .select('id, name, file_url')
      .ilike('file_url', '%.webp');

    if (fetchError) {
      throw new Error(`Failed to fetch stickers: ${fetchError.message}`);
    }

    if (!stickers || stickers.length === 0) {
      console.log('No WebP stickers found to convert.');
      return;
    }

    console.log(`Found ${stickers.length} WebP stickers to convert.\n`);

    let convertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const sticker of stickers) {
      try {
        console.log(`Processing: ${sticker.name}...`);

        // Check if PNG version already exists
        const pngUrl = sticker.file_url.replace('.webp', '.png');
        const pngPath = pngUrl.replace('/storage/v1/object/public/stickers/', '');
        
        const { data: existingFile } = await supabase.storage
          .from('stickers')
          .list('stickers', {
            search: path.basename(pngPath)
          });

        if (existingFile && existingFile.length > 0) {
          console.log(`  ⏭️  PNG already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Download WebP file
        console.log(`  📥 Downloading WebP...`);
        const response = await fetch(sticker.file_url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status}`);
        }
        const webpBuffer = Buffer.from(await response.arrayBuffer());

        // Convert WebP to PNG using Sharp
        console.log(`  🔄 Converting to PNG...`);
        const pngBuffer = await sharp(webpBuffer)
          .png({
            quality: 100,
            compressionLevel: 6, // Good compression without quality loss
          })
          .toBuffer();

        // Upload PNG to Supabase Storage
        console.log(`  📤 Uploading PNG...`);
        const pngFileName = path.basename(pngPath);
        const { error: uploadError } = await supabase.storage
          .from('stickers')
          .upload(`stickers/${pngFileName}`, pngBuffer, {
            contentType: 'image/png',
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log(`  ✅ Successfully converted and uploaded: ${pngFileName}`);
        convertedCount++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`  ❌ Error processing ${sticker.name}: ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n📊 CONVERSION SUMMARY:');
    console.log(`✅ Successfully converted: ${convertedCount}`);
    console.log(`⏭️  Already existed (skipped): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total processed: ${stickers.length}`);

    if (convertedCount > 0) {
      console.log('\n🎉 PNG versions are now available for WhatsApp Web users!');
      console.log('💡 Users will automatically get PNG on desktop and WebP on mobile.');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the conversion
convertWebPToPNG();