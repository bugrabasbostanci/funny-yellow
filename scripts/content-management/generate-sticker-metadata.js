const fs = require('fs');
const path = require('path');

// Function to generate slug from filename
function generateSlug(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Function to extract tags from filename and visual analysis
function generateTags(filename) {
  const name = filename.toLowerCase();
  const tags = new Set();
  
  // Character-based tags
  if (name.includes('kermit')) tags.add('kermit');
  if (name.includes('shrek')) tags.add('shrek');
  if (name.includes('agent')) tags.add('agent');
  if (name.includes('monkey')) tags.add('monkey');
  if (name.includes('cat')) tags.add('cat');
  if (name.includes('sunflower') || name.includes('flower')) tags.add('flower');
  if (name.includes('rose')) tags.add('rose');
  
  // Emotion-based tags
  if (name.includes('angry')) tags.add('angry');
  if (name.includes('sad') || name.includes('depressed') || name.includes('despair')) tags.add('sad');
  if (name.includes('happy') || name.includes('smile') || name.includes('shinny')) tags.add('happy');
  if (name.includes('nervous') || name.includes('suspicious')) tags.add('nervous');
  if (name.includes('crazy')) tags.add('crazy');
  if (name.includes('cute')) tags.add('cute');
  if (name.includes('hope')) tags.add('hope');
  if (name.includes('wonder')) tags.add('wonder');
  if (name.includes('villain') || name.includes('spy')) tags.add('villain');
  if (name.includes('sly')) tags.add('sly');
  
  // Action-based tags
  if (name.includes('walking')) tags.add('walking');
  if (name.includes('bowing')) tags.add('bowing');
  if (name.includes('covering')) tags.add('covering');
  if (name.includes('denying') || name.includes('refuse')) tags.add('denying');
  if (name.includes('pointing')) tags.add('pointing');
  if (name.includes('ponder') || name.includes('thinking')) tags.add('thinking');
  if (name.includes('rubbing')) tags.add('rubbing');
  if (name.includes('touching')) tags.add('touching');
  if (name.includes('hiding')) tags.add('hiding');
  if (name.includes('giving')) tags.add('giving');
  if (name.includes('middle-finger')) tags.add('rude');
  if (name.includes('thumbs') || name.includes('thumps')) tags.add('thumbs');
  if (name.includes('wink')) tags.add('wink');
  if (name.includes('smoking')) tags.add('smoking');
  if (name.includes('sitting')) tags.add('sitting');
  if (name.includes('face-palm')) tags.add('facepalm');
  if (name.includes('side-eye')) tags.add('sideeye');
  
  // Mood/reaction tags
  if (name.includes('poor')) tags.add('poor');
  if (name.includes('yuck')) tags.add('disgusted');
  if (name.includes('rizz')) tags.add('rizz');
  
  // General categories
  tags.add('emoji');
  tags.add('reaction');
  
  // Add meme tag for popular meme characters
  if (name.includes('kermit') || name.includes('shrek') || name.includes('monkey')) {
    tags.add('meme');
  }
  
  // Add funny tag for obviously humorous stickers
  if (name.includes('funny') || name.includes('middle-finger') || name.includes('rizz') || name.includes('yuck')) {
    tags.add('funny');
  }
  
  return Array.from(tags);
}

// Function to generate proper name from filename
function generateName(filename) {
  return filename
    .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to generate metadata for a sticker
function generateStickerMetadata(filename) {
  const slug = generateSlug(filename);
  const name = generateName(filename);
  const tags = generateTags(filename);
  
  return {
    name,
    slug,
    tags,
    file_url: `/stickers/source/${filename}`,
    thumbnail_url: `/stickers/source/${filename}`, // Using same image as thumbnail for now
    file_size: 0, // Will need to be calculated
    file_format: 'png',
    width: 512, // Default WhatsApp sticker size
    height: 512, // Default WhatsApp sticker size
    download_count: 0
  };
}

// Main function to process all stickers
function generateAllMetadata() {
  const sourceDir = path.join(__dirname, '..', 'public', 'stickers', 'source');
  
  if (!fs.existsSync(sourceDir)) {
    console.error('Source directory not found:', sourceDir);
    return;
  }
  
  const files = fs.readdirSync(sourceDir);
  const imageFiles = files.filter(file => 
    /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
  );
  
  console.log(`Found ${imageFiles.length} image files`);
  
  const metadata = imageFiles.map(file => {
    const meta = generateStickerMetadata(file);
    console.log(`Generated metadata for: ${file}`);
    console.log(`  Name: ${meta.name}`);
    console.log(`  Slug: ${meta.slug}`);
    console.log(`  Tags: ${meta.tags.join(', ')}`);
    console.log('');
    return meta;
  });
  
  // Save metadata to JSON file
  const outputPath = path.join(__dirname, 'sticker-metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`Metadata saved to: ${outputPath}`);
  
  // Also generate SQL insert statements
  const sqlStatements = metadata.map(meta => {
    const tagsArray = meta.tags.length > 0 ? `'{${meta.tags.map(tag => `"${tag}"`).join(',')}}'` : 'NULL';
    return `INSERT INTO stickers (name, slug, tags, file_url, thumbnail_url, file_size, file_format, width, height, download_count) VALUES ('${meta.name.replace(/'/g, "''")}', '${meta.slug}', ${tagsArray}, '${meta.file_url}', '${meta.thumbnail_url}', ${meta.file_size}, '${meta.file_format}', ${meta.width}, ${meta.height}, ${meta.download_count});`;
  });
  
  const sqlPath = path.join(__dirname, 'sticker-inserts.sql');
  fs.writeFileSync(sqlPath, sqlStatements.join('\n'));
  console.log(`SQL insert statements saved to: ${sqlPath}`);
  
  return metadata;
}

// Run the script
if (require.main === module) {
  generateAllMetadata();
}

module.exports = { generateAllMetadata, generateStickerMetadata };