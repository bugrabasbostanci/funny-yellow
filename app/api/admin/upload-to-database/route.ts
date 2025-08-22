import { NextResponse } from 'next/server';

// Use Edge runtime for Cloudflare compatibility
export const runtime = 'edge';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function generateMetadata(fileName: string) {
  // Extract name from filename and generate basic metadata
  const name = fileName
    .replace('.webp', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  // Smart tag generation based on filename keywords
  const tags: string[] = [];
  const lowerFileName = fileName.toLowerCase();
  
  // Emotion-based tags
  if (lowerFileName.includes('happy') || lowerFileName.includes('smile') || lowerFileName.includes('joy')) tags.push('happy');
  if (lowerFileName.includes('sad') || lowerFileName.includes('cry') || lowerFileName.includes('tear')) tags.push('sad');
  if (lowerFileName.includes('angry') || lowerFileName.includes('mad') || lowerFileName.includes('rage')) tags.push('angry');
  if (lowerFileName.includes('love') || lowerFileName.includes('heart') || lowerFileName.includes('kiss')) tags.push('love');
  if (lowerFileName.includes('funny') || lowerFileName.includes('laugh') || lowerFileName.includes('lol')) tags.push('funny');
  
  // Category-based tags
  if (lowerFileName.includes('animal') || lowerFileName.includes('cat') || lowerFileName.includes('dog') || 
      lowerFileName.includes('bird') || lowerFileName.includes('fish') || lowerFileName.includes('pet')) tags.push('animals');
  if (lowerFileName.includes('food') || lowerFileName.includes('eat') || lowerFileName.includes('drink') || 
      lowerFileName.includes('cake') || lowerFileName.includes('pizza')) tags.push('food');
  if (lowerFileName.includes('party') || lowerFileName.includes('celebrate') || lowerFileName.includes('birthday')) tags.push('celebration');
  if (lowerFileName.includes('cool') || lowerFileName.includes('awesome') || lowerFileName.includes('nice')) tags.push('cool');
  if (lowerFileName.includes('nature') || lowerFileName.includes('flower') || lowerFileName.includes('tree')) tags.push('nature');
  if (lowerFileName.includes('meme') || lowerFileName.includes('viral')) tags.push('memes');
  
  // Object-based tags
  if (lowerFileName.includes('car') || lowerFileName.includes('phone') || lowerFileName.includes('computer') || 
      lowerFileName.includes('book') || lowerFileName.includes('ball')) tags.push('objects');
  
  // Expression-based tags
  if (lowerFileName.includes('shock') || lowerFileName.includes('surprise') || lowerFileName.includes('wow') ||
      lowerFileName.includes('expression') || lowerFileName.includes('face')) tags.push('expressions');
  
  // Default fallback tags only if no specific tags found
  if (tags.length === 0) {
    // Check if it's likely an emoji-style sticker
    if (lowerFileName.includes('emoji') || lowerFileName.includes('reaction') || 
        lowerFileName.includes('face') || lowerFileName.includes('expression')) {
      tags.push('emoji');
    }
  }

  return {
    name,
    tags: [...new Set(tags)], // Remove duplicates
    slug: name.toLowerCase().replace(/\s+/g, '-')
  };
}

export async function POST() {
  try {
    console.log('🚀 Starting database upload process...');

    // Get WebP files from Supabase Storage
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('stickers')
      .list('webp', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      return NextResponse.json({ 
        error: 'Failed to list WebP files', 
        details: listError.message 
      }, { status: 500 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ 
        message: 'No WebP files found to upload',
        processed: 0,
        successful: 0,
        failed: 0
      });
    }

    console.log(`📋 Found ${files.length} WebP files to process`);

    const results = [];
    let successful = 0;
    let failed = 0;
    let updated = 0;

    for (const file of files) {
      try {
        console.log(`📤 Processing: ${file.name}`);

        // Get public URL for the file
        const { data: urlData } = supabaseAdmin.storage
          .from('stickers')
          .getPublicUrl(`webp/${file.name}`);

        const metadata = generateMetadata(file.name);

        // Check if sticker already exists
        const { data: existingSticker } = await supabaseAdmin
          .from('stickers')
          .select('id')
          .eq('slug', metadata.slug)
          .single();

        if (existingSticker) {
          // Update existing sticker
          const { error: dbError } = await supabaseAdmin
            .from('stickers')
            .update({
              file_url: urlData.publicUrl,
              thumbnail_url: urlData.publicUrl,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSticker.id)
            .select()
            .single();

          if (dbError) {
            console.error(`❌ Database update failed for ${file.name}:`, dbError);
            failed++;
            results.push({
              fileName: file.name,
              status: 'failed',
              error: `Database update failed: ${dbError.message}`
            });
            continue;
          }

          updated++;
          results.push({
            fileName: file.name,
            status: 'updated',
            id: existingSticker.id,
            url: urlData.publicUrl
          });

          console.log(`✅ Updated existing record for ${file.name}`);
        } else {
          // Insert new sticker record
          const stickerRecord = {
            name: metadata.name,
            slug: metadata.slug,
            tags: metadata.tags,
            file_url: urlData.publicUrl,
            thumbnail_url: urlData.publicUrl,
            download_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const { data: dbData, error: dbError } = await supabaseAdmin
            .from('stickers')
            .insert(stickerRecord)
            .select()
            .single();

          if (dbError) {
            console.error(`❌ Database insert failed for ${file.name}:`, dbError);
            failed++;
            results.push({
              fileName: file.name,
              status: 'failed',
              error: `Database insert failed: ${dbError.message}`
            });
            continue;
          }

          successful++;
          results.push({
            fileName: file.name,
            status: 'created',
            id: dbData.id,
            url: urlData.publicUrl
          });

          console.log(`✅ Created new record for ${file.name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        failed++;
        results.push({
          fileName: file.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Database upload completed',
      processed: files.length,
      successful,
      updated,
      failed,
      results
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check database status
export async function GET() {
  try {
    const { count } = await supabaseAdmin
      .from('stickers')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      totalStickers: count || 0,
      status: 'ready'
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get database status' },
      { status: 500 }
    );
  }
}