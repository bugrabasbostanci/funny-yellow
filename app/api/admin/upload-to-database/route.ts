import { NextResponse } from 'next/server';

// Use Node.js runtime for database operations
export const runtime = 'nodejs';

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

  // Basic tag generation based on filename
  const tags = ['emoji', 'reaction'];
  
  if (fileName.includes('happy') || fileName.includes('smile')) tags.push('happy');
  if (fileName.includes('sad') || fileName.includes('cry')) tags.push('sad');
  if (fileName.includes('angry') || fileName.includes('mad')) tags.push('angry');
  if (fileName.includes('love') || fileName.includes('heart')) tags.push('love');
  if (fileName.includes('funny') || fileName.includes('laugh')) tags.push('funny');
  if (fileName.includes('animal') || fileName.includes('cat') || fileName.includes('dog')) tags.push('animals');
  if (fileName.includes('food')) tags.push('food');

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