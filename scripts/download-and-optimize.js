const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sourceDir = path.join(__dirname, '../public/stickers/source');
const outputDir = path.join(__dirname, '../public/stickers/webp');

// Create directories if they don't exist
[sourceDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const SETTINGS = {
  targetSize: 512,
  maxFileSizeKB: 200,
  qualityLevels: [95, 90, 85, 80, 75],
  supportedFormats: ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif']
};

async function downloadFromSupabase() {
  try {
    console.log('📥 Downloading files from Supabase Storage...');
    
    // List files in source folder
    const { data: files, error } = await supabaseAdmin.storage
      .from('stickers')
      .list('source', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ Error listing files:', error);
      return false;
    }

    if (!files || files.length === 0) {
      console.log('📁 No files found in Supabase Storage source folder');
      return true;
    }

    console.log(`📋 Found ${files.length} files in storage`);

    for (const file of files) {
      try {
        // Download file
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from('stickers')
          .download(`source/${file.name}`);

        if (downloadError) {
          console.error(`❌ Error downloading ${file.name}:`, downloadError);
          continue;
        }

        // Save to local source directory
        const localPath = path.join(sourceDir, file.name);
        const buffer = Buffer.from(await fileData.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        
        console.log(`✅ Downloaded: ${file.name}`);
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Error in download process:', error);
    return false;
  }
}

async function optimizeSticker(inputPath, outputPath) {
  try {
    const fileName = path.basename(inputPath);
    console.log(`\n🔄 Processing: ${fileName}`);
    
    const info = await sharp(inputPath).metadata();
    console.log(`   📐 Original: ${info.width}x${info.height} (${info.format})`);
    
    // Try different quality levels to meet file size requirements
    for (const quality of SETTINGS.qualityLevels) {
      try {
        await sharp(inputPath)
          .resize(SETTINGS.targetSize, SETTINGS.targetSize, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ 
            quality,
            effort: 6,
            alphaQuality: 100
          })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        const sizeKB = Math.round(stats.size / 1024);
        
        if (sizeKB <= SETTINGS.maxFileSizeKB) {
          console.log(`   ✅ Optimized: ${SETTINGS.targetSize}x${SETTINGS.targetSize} WebP, ${sizeKB}KB (Q${quality})`);
          return true;
        } else if (quality === SETTINGS.qualityLevels[SETTINGS.qualityLevels.length - 1]) {
          console.log(`   ⚠️ Final attempt: ${SETTINGS.targetSize}x${SETTINGS.targetSize} WebP, ${sizeKB}KB (Q${quality})`);
          return true;
        }
      } catch (qualityError) {
        console.error(`   ❌ Quality ${quality} failed:`, qualityError.message);
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error optimizing ${path.basename(inputPath)}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting download and optimization process...\n');
  
  // Step 1: Download files from Supabase
  const downloadSuccess = await downloadFromSupabase();
  if (!downloadSuccess) {
    console.error('❌ Download process failed');
    process.exit(1);
  }
  
  // Step 2: Optimize downloaded files
  console.log('\n🔄 Starting optimization process...');
  
  const sourceFiles = fs.readdirSync(sourceDir);
  const supportedFiles = sourceFiles.filter(file => {
    const ext = path.extname(file.toLowerCase());
    return SETTINGS.supportedFormats.includes(ext);
  });

  if (supportedFiles.length === 0) {
    console.log('📁 No supported image files found in source directory');
    return;
  }

  console.log(`📋 Found ${supportedFiles.length} image files to process\n`);

  let processed = 0;
  let successful = 0;
  let failed = 0;

  for (const file of supportedFiles) {
    const inputPath = path.join(sourceDir, file);
    const outputName = path.basename(file, path.extname(file)) + '.webp';
    const outputPath = path.join(outputDir, outputName);
    
    processed++;
    const success = await optimizeSticker(inputPath, outputPath);
    
    if (success) {
      successful++;
    } else {
      failed++;
    }
  }

  console.log('\n📊 Optimization Summary:');
  console.log(`   📁 Total files processed: ${processed}`);
  console.log(`   ✅ Successfully optimized: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (successful > 0) {
    console.log('\n🎉 Optimization completed! Next steps:');
    console.log('   1. Run: npm run upload-stickers');
    console.log('   2. Run: npm run convert-webp-to-png');
  }
}

main().catch(console.error);