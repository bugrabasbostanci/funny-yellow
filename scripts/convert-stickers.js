const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const stickersDir = path.join(__dirname, '../public/stickers');
const outputDir = path.join(__dirname, '../public/stickers/webp');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function convertSvgToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath, { density: 300 })
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({
        quality: 85,
        lossless: false,
        effort: 6
      })
      .toFile(outputPath);
    
    console.log(`✅ Converted: ${path.basename(inputPath)} → ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(inputPath)}:`, error.message);
  }
}

async function convertAllStickers() {
  try {
    console.log('🔄 Starting sticker conversion to WebP format...\n');
    
    const files = fs.readdirSync(stickersDir);
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    
    console.log(`Found ${svgFiles.length} SVG stickers to convert:\n`);
    
    for (const file of svgFiles) {
      const inputPath = path.join(stickersDir, file);
      const outputFileName = file.replace('.svg', '.webp');
      const outputPath = path.join(outputDir, outputFileName);
      
      await convertSvgToWebP(inputPath, outputPath);
    }
    
    console.log(`\n✅ Successfully converted ${svgFiles.length} stickers to WebP format!`);
    console.log(`📁 Output directory: ${outputDir}`);
    
    // List converted files
    const convertedFiles = fs.readdirSync(outputDir);
    console.log(`\n📋 Converted files (${convertedFiles.length}):`);
    convertedFiles.forEach(file => {
      const stats = fs.statSync(path.join(outputDir, file));
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`   • ${file} (${sizeKB} KB)`);
    });
    
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

// Run the conversion
convertAllStickers();