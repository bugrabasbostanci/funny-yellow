const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = path.join(__dirname, '../public/stickers/source');
const outputDir = path.join(__dirname, '../public/stickers/webp');

// Create directories if they don't exist
[sourceDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Optimization settings
const SETTINGS = {
  targetSize: 512,
  maxFileSizeKB: 200, // Increased for better quality
  qualityLevels: [95, 90, 85, 80, 75], // Higher minimum quality for better results
  supportedFormats: ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif']
};

async function getImageInfo(inputPath) {
  try {
    const metadata = await sharp(inputPath).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha
    };
  } catch (error) {
    console.error(`❌ Cannot read image metadata: ${path.basename(inputPath)}`);
    return null;
  }
}

async function optimizeSticker(inputPath, outputPath) {
  try {
    const fileName = path.basename(inputPath);
    console.log(`\n🔄 Processing: ${fileName}`);
    
    // Get image information
    const info = await getImageInfo(inputPath);
    if (!info) return false;
    
    console.log(`   📐 Original: ${info.width}x${info.height} (${info.format})`);
    console.log(`   🎨 Has transparency: ${info.hasAlpha ? 'Yes' : 'No'}`);
    
    // Note: Background removal should be done manually using remove.bg before placing files in source/
    // This ensures transparency is already handled and we only need to optimize
    console.log(`   💡 Expecting pre-processed images (background already removed)`);
    const processedImageBuffer = await fs.promises.readFile(inputPath);
    
    // Determine resize strategy based on aspect ratio
    const aspectRatio = info.width / info.height;
    let resizeOptions;
    
    if (Math.abs(aspectRatio - 1) < 0.1) {
      // Nearly square - direct resize
      resizeOptions = {
        width: SETTINGS.targetSize,
        height: SETTINGS.targetSize,
        fit: 'fill'
      };
      console.log(`   ↗️  Strategy: Direct resize (square-ish: ${aspectRatio.toFixed(2)})`);
    } else {
      // Not square - fit with padding
      resizeOptions = {
        width: SETTINGS.targetSize,
        height: SETTINGS.targetSize,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      };
      console.log(`   📦 Strategy: Fit with padding (aspect: ${aspectRatio.toFixed(2)})`);
    }
    
    // Try different quality levels to achieve target file size
    for (const quality of SETTINGS.qualityLevels) {
      try {
        let pipeline = sharp(processedImageBuffer);
        
        const buffer = await pipeline
          .resize(resizeOptions)
          .webp({
            quality: quality,
            lossless: false,
            effort: 6,
            nearLossless: false
          })
          .toBuffer();
        
        const fileSizeKB = Math.round(buffer.length / 1024);
        
        if (fileSizeKB <= SETTINGS.maxFileSizeKB || quality === SETTINGS.qualityLevels[SETTINGS.qualityLevels.length - 1]) {
          // Write the file
          await fs.promises.writeFile(outputPath, buffer);
          
          console.log(`   ✅ Success: ${SETTINGS.targetSize}x${SETTINGS.targetSize} WebP`);
          console.log(`   📊 Quality: ${quality}% | Size: ${fileSizeKB} KB`);
          
          if (fileSizeKB > SETTINGS.maxFileSizeKB) {
            console.log(`   ⚠️  Warning: File size (${fileSizeKB} KB) exceeds target (${SETTINGS.maxFileSizeKB} KB)`);
          }
          
          return true;
        } else {
          console.log(`   🔄 Quality ${quality}%: ${fileSizeKB} KB (too large, trying lower quality)`);
        }
      } catch (error) {
        console.log(`   ❌ Failed at quality ${quality}%: ${error.message}`);
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`   ❌ Error processing ${path.basename(inputPath)}: ${error.message}`);
    return false;
  }
}

async function processAllStickers() {
  try {
    console.log('🎨 Funny Yellow Sticker Optimizer\n');
    console.log(`📁 Source directory: ${sourceDir}`);
    console.log(`📁 Output directory: ${outputDir}`);
    console.log(`🎯 Target: ${SETTINGS.targetSize}x${SETTINGS.targetSize} WebP, max ${SETTINGS.maxFileSizeKB} KB\n`);
    
    if (!fs.existsSync(sourceDir)) {
      console.log(`❌ Source directory doesn't exist: ${sourceDir}`);
      console.log(`💡 Create the directory and add your sticker source files there.`);
      return;
    }
    
    const files = fs.readdirSync(sourceDir);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return SETTINGS.supportedFormats.includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log(`📁 No supported image files found in ${sourceDir}`);
      console.log(`🔍 Supported formats: ${SETTINGS.supportedFormats.join(', ')}`);
      return;
    }
    
    console.log(`🔍 Found ${imageFiles.length} image files to process:\n`);
    
    let successCount = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const file of imageFiles) {
      const inputPath = path.join(sourceDir, file);
      const outputFileName = path.parse(file).name + '.webp';
      const outputPath = path.join(outputDir, outputFileName);
      
      // Get original file size
      const originalStats = fs.statSync(inputPath);
      totalOriginalSize += originalStats.size;
      
      const success = await optimizeSticker(inputPath, outputPath);
      
      if (success) {
        successCount++;
        const optimizedStats = fs.statSync(outputPath);
        totalOptimizedSize += optimizedStats.size;
      }
    }
    
    // Summary
    console.log(`\n📊 SUMMARY`);
    console.log(`═══════════════════════════════════════════`);
    console.log(`✅ Successfully processed: ${successCount}/${imageFiles.length} files`);
    console.log(`📏 Original total size: ${Math.round(totalOriginalSize / 1024)} KB`);
    console.log(`📏 Optimized total size: ${Math.round(totalOptimizedSize / 1024)} KB`);
    
    if (totalOriginalSize > 0) {
      const compressionRatio = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100);
      console.log(`💾 Space saved: ${compressionRatio.toFixed(1)}%`);
    }
    
    if (successCount > 0) {
      console.log(`\n📋 Generated files in ${outputDir}:`);
      const outputFiles = fs.readdirSync(outputDir);
      outputFiles.forEach(file => {
        const stats = fs.statSync(path.join(outputDir, file));
        const sizeKB = Math.round(stats.size / 1024);
        const sizeIcon = sizeKB <= SETTINGS.maxFileSizeKB ? '✅' : '⚠️';
        console.log(`   ${sizeIcon} ${file} (${sizeKB} KB)`);
      });
    }
    
    console.log(`\n🎉 Optimization complete!`);
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Run the optimization
if (require.main === module) {
  processAllStickers();
}

module.exports = { optimizeSticker, getImageInfo, SETTINGS };