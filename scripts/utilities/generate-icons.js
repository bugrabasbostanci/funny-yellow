const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/funny-yellow-logo.svg');
  const publicPath = path.join(__dirname, '../public');

  if (!fs.existsSync(svgPath)) {
    console.error('SVG logo not found at:', svgPath);
    return;
  }

  try {
    // Generate 192x192 icon
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(publicPath, 'icon-192.png'));
    
    console.log('✅ Generated icon-192.png');

    // Generate 512x512 icon
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(publicPath, 'icon-512.png'));
    
    console.log('✅ Generated icon-512.png');

    // Also generate favicon sizes
    await sharp(svgPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicPath, 'favicon-32x32.png'));
    
    console.log('✅ Generated favicon-32x32.png');

    await sharp(svgPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicPath, 'favicon-16x16.png'));
    
    console.log('✅ Generated favicon-16x16.png');

    console.log('🎉 All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();