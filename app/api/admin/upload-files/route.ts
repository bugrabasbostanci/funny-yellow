import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const files = formData.getAll('files') as File[];
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const sourceDir = path.join(process.cwd(), 'public', 'stickers', 'source');
    
    // Ensure source directory exists
    if (!existsSync(sourceDir)) {
      await mkdir(sourceDir, { recursive: true });
    }

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

        const filePath = path.join(sourceDir, fileName);
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);
        
        results.push({
          originalName: file.name,
          fileName,
          size: file.size,
          type: file.type,
          metadata: metadata[file.name] || null
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: results.length,
      total: files.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}