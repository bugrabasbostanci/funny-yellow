import { NextRequest, NextResponse } from 'next/server';

// Use Node.js runtime for file operations
export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const files = formData.getAll('files') as File[];
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    console.log(`📤 Processing ${files.length} files for admin upload...`);

    const results = [];
    const errors = [];

    for (const file of files) {
      try {
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Not an image file`);
          continue;
        }

        // Sanitize filename
        const fileName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9.-]/g, '-')
          .replace(/-+/g, '-');

        console.log(`📁 Uploading: ${file.name} → ${fileName}`);

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage using service role (bypasses RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
          .from('stickers')
          .upload(`source/${fileName}`, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`❌ Upload failed for ${fileName}:`, uploadError);
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        results.push({
          originalName: file.name,
          fileName,
          size: file.size,
          type: file.type,
          metadata: metadata[file.name] || null,
          uploadPath: uploadData.path
        });

        console.log(`✅ Successfully uploaded: ${fileName}`);

      } catch (error) {
        console.error(`❌ Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`📊 Upload summary: ${results.length} successful, ${errors.length} failed`);

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      total: files.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Upload API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}