import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Server expects pre-optimized files from client-side processing

function generateMetadata(fileName: string) {
  const name = fileName
    .replace(/\.(png|jpg|jpeg|webp|svg)$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

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
  
  // Reaction-based tags
  if (lowerFileName.includes('reaction') || lowerFileName.includes('react') || 
      lowerFileName.includes('response') || lowerFileName.includes('reply')) tags.push('reactions');
  
  return {
    name,
    tags: [...new Set(tags)],
    slug: name.toLowerCase().replace(/\s+/g, '-')
  };
}

export async function POST(request: NextRequest) {
  try {
    // Generate batch ID using crypto.randomUUID (Edge Runtime compatible)
    const batchId = crypto.randomUUID();
    console.log(`🚀 Starting batch processing: ${batchId}`);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const metadataJson = formData.get('metadata') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json({ 
        error: 'No files provided' 
      }, { status: 400 });
    }

    const providedMetadata = metadataJson ? JSON.parse(metadataJson) : {};
    
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const file of files) {
      try {
        console.log(`📤 Processing: ${file.name}`);

        // Use provided metadata or generate from filename
        const userMetadata = providedMetadata[file.name];
        const autoMetadata = generateMetadata(file.name);
        
        const finalMetadata = {
          name: userMetadata?.name || autoMetadata.name,
          tags: userMetadata?.tags?.length > 0 ? userMetadata.tags : autoMetadata.tags,
          slug: autoMetadata.slug
        };

        // File comes pre-optimized from client-side (512x512 WebP)
        const fileBuffer = await file.arrayBuffer();
        
        // Generate filename (expecting WebP from client)
        const timestamp = Date.now();
        const baseFileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
        const fileName = `${timestamp}-${baseFileName}.webp`;
        
        console.log(`📤 Uploading pre-optimized file: ${file.name} → ${fileName}`);
        console.log(`   📊 Size: ${Math.round(file.size / 1024)} KB | Type: ${file.type}`);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('stickers')
          .upload(`webp/${fileName}`, fileBuffer, {
            contentType: file.type || 'image/webp',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('stickers')
          .getPublicUrl(`webp/${fileName}`);

        // Save to database
        const stickerRecord = {
          name: finalMetadata.name,
          slug: finalMetadata.slug,
          tags: finalMetadata.tags,
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
          throw new Error(`Database insert failed: ${dbError.message}`);
        }

        successful++;
        results.push({
          originalName: file.name,
          status: 'success' as const,
          stickerId: dbData.id,
          webpUrl: urlData.publicUrl,
          pngUrl: urlData.publicUrl, // Same URL, pre-optimized WebP
          optimization: {
            dimensions: '512x512', // Client-side optimized
            sizeKB: Math.round(file.size / 1024),
            format: 'WebP',
            processedOn: 'client-side'
          }
        });

        console.log(`✅ Successfully uploaded: ${file.name} (${Math.round(file.size / 1024)}KB)`);

      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        failed++;
        results.push({
          originalName: file.name,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      batchId,
      summary: {
        total: files.length,
        successful,
        failed
      },
      results
    });

  } catch (error) {
    console.error('❌ Batch processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/admin/process-sticker-batch',
    status: 'Edge Runtime - Client-side processing ready',
    message: 'Batch upload for pre-optimized files from client-side Canvas processing',
    features: [
      'Handles pre-optimized 512x512 WebP files from client',
      'Edge Runtime compatible (Cloudflare Pages)',
      'Fast upload without server-side image processing',
      'Automatic upload to Supabase Storage',
      'Smart metadata generation from filenames',
      'Batch database insertion',
      'Custom tag support from admin interface'
    ],
    processing: {
      location: 'client-side',
      expectedFormat: '512x512 WebP',
      serverRole: 'Upload and store pre-processed files'
    }
  });
}