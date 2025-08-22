import { NextRequest, NextResponse } from 'next/server';

// Use Node.js runtime for file operations and Sharp.js
export const runtime = 'nodejs';

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const SETTINGS = {
  targetSize: 512,
  maxFileSizeKB: 200,
  qualityLevels: [95, 90, 85, 80, 75],
  maxConcurrency: 3, // Process max 3 files simultaneously
};

interface ProcessingResult {
  originalName: string;
  fileName: string;
  status: 'success' | 'failed';
  error?: string;
  webpUrl?: string;
  pngUrl?: string;
  stickerId?: string;
  metadata?: { name: string; tags: string[]; slug: string };
}

// Removed unused ProcessingStep interface

async function optimizeImage(buffer: Buffer, fileName: string, targetFormat: 'webp' | 'png') {
  console.log(`🔄 Optimizing ${fileName} to ${targetFormat}`);
  
  const qualityLevels = targetFormat === 'webp' ? SETTINGS.qualityLevels : [100];
  
  for (const quality of qualityLevels) {
    try {
      let sharpInstance = sharp(buffer)
        .resize(SETTINGS.targetSize, SETTINGS.targetSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });

      if (targetFormat === 'webp') {
        sharpInstance = sharpInstance.webp({ 
          quality,
          effort: 6,
          alphaQuality: 100
        });
      } else {
        sharpInstance = sharpInstance.png({
          quality: 100,
          compressionLevel: 6
        });
      }

      const optimizedBuffer = await sharpInstance.toBuffer();
      const sizeKB = Math.round(optimizedBuffer.length / 1024);
      
      if (targetFormat === 'webp' && sizeKB <= SETTINGS.maxFileSizeKB || targetFormat === 'png') {
        console.log(`✅ Optimized ${fileName}: ${SETTINGS.targetSize}x${SETTINGS.targetSize} ${targetFormat.toUpperCase()}, ${sizeKB}KB (Q${quality})`);
        return optimizedBuffer;
      } else if (quality === qualityLevels[qualityLevels.length - 1]) {
        console.log(`⚠️ Final attempt ${fileName}: ${sizeKB}KB (Q${quality})`);
        return optimizedBuffer;
      }
    } catch (qualityError) {
      console.error(`❌ Quality ${quality} failed for ${fileName}:`, qualityError);
      continue;
    }
  }
  
  throw new Error(`Optimization failed for all quality levels: ${fileName}`);
}

function generateMetadata(fileName: string, userMetadata?: { name?: string; tags?: string[]; slug?: string } | null) {
  // Use user-provided metadata or generate from filename
  if (userMetadata) {
    return {
      name: userMetadata.name || fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
      tags: userMetadata.tags || ['emoji', 'reaction'],
      slug: userMetadata.slug || userMetadata.name?.toLowerCase().replace(/\s+/g, '-') || fileName.replace(/\.[^/.]+$/, '').toLowerCase()
    };
  }

  // Auto-generate metadata from filename
  const name = fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const tags = ['emoji', 'reaction'];
  
  // Smart tag generation based on filename
  const lowerName = fileName.toLowerCase();
  if (lowerName.includes('happy') || lowerName.includes('smile') || lowerName.includes('joy')) tags.push('happy');
  if (lowerName.includes('sad') || lowerName.includes('cry') || lowerName.includes('tear')) tags.push('sad');
  if (lowerName.includes('angry') || lowerName.includes('mad') || lowerName.includes('rage')) tags.push('angry');
  if (lowerName.includes('love') || lowerName.includes('heart') || lowerName.includes('kiss')) tags.push('love');
  if (lowerName.includes('funny') || lowerName.includes('laugh') || lowerName.includes('lol')) tags.push('funny');
  if (lowerName.includes('animal') || lowerName.includes('cat') || lowerName.includes('dog') || lowerName.includes('pet')) tags.push('animals');
  if (lowerName.includes('food') || lowerName.includes('eat') || lowerName.includes('drink')) tags.push('food');
  if (lowerName.includes('cool') || lowerName.includes('awesome') || lowerName.includes('nice')) tags.push('cool');

  return {
    name,
    tags: [...new Set(tags)],
    slug: name.toLowerCase().replace(/\s+/g, '-')
  };
}

interface TempAsset {
  type: 'storage';
  bucket: string;
  path: string;
  cleanup: () => Promise<void>;
}

class TransactionManager {
  private tempAssets: TempAsset[] = [];
  private dbOperations: Array<{ table: string; operation: string; id?: string; data?: unknown }> = [];

  async addTempAsset(bucket: string, path: string): Promise<void> {
    const cleanup = async () => {
      try {
        await supabaseAdmin.storage.from(bucket).remove([path]);
        console.log(`🧹 Cleaned up: ${bucket}/${path}`);
      } catch (error) {
        console.warn(`⚠️ Failed to cleanup ${bucket}/${path}:`, error);
      }
    };

    this.tempAssets.push({
      type: 'storage',
      bucket,
      path,
      cleanup
    });
  }

  async rollback(): Promise<void> {
    console.log(`🔄 Rolling back ${this.tempAssets.length} temporary assets...`);
    
    const cleanupPromises = this.tempAssets.map(asset => asset.cleanup());
    await Promise.allSettled(cleanupPromises);
    
    this.tempAssets = [];
    this.dbOperations = [];
    console.log(`✅ Rollback completed`);
  }

  async commit(): Promise<void> {
    // For now, just clear the tracking since files are already in permanent location
    // In a more advanced system, this would finalize transactions
    this.tempAssets = [];
    this.dbOperations = [];
    console.log(`✅ Transaction committed`);
  }
}

async function processFileToStorage(file: File, metadata: { name?: string; tags?: string[]; slug?: string } | null, _batchId: string, transaction: TransactionManager): Promise<ProcessingResult> {
  const originalName = file.name;
  const sanitizedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');

  let webpFileName: string | null = null;
  let pngFileName: string | null = null;
  let webpBuffer: Buffer;
  let pngBuffer: Buffer;

  try {
    console.log(`\n📁 Processing: ${originalName} → ${sanitizedName}`);

    // Step 1: Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Not an image file');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File too large (max 10MB)');
    }

    // Step 2: Get file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Step 3: Generate both WebP and PNG versions
    [webpBuffer, pngBuffer] = await Promise.all([
      optimizeImage(buffer, sanitizedName, 'webp'),
      optimizeImage(buffer, sanitizedName, 'png')
    ]);

    // Step 4: Generate unique filenames with batch prefix
    const timestamp = Date.now();
    webpFileName = `${timestamp}-${sanitizedName.replace(/\.[^/.]+$/, '.webp')}`;
    pngFileName = `${timestamp}-${sanitizedName.replace(/\.[^/.]+$/, '.png')}`;

    // Step 5: Upload to storage (both formats) - these are tracked for rollback
    const [webpUpload, pngUpload] = await Promise.all([
      supabaseAdmin.storage
        .from('stickers')
        .upload(`stickers/${webpFileName}`, webpBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false // Prevent accidental overwrites
        }),
      supabaseAdmin.storage
        .from('stickers')
        .upload(`stickers/${pngFileName}`, pngBuffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })
    ]);

    if (webpUpload.error || pngUpload.error) {
      throw new Error(`Storage upload failed: ${webpUpload.error?.message || pngUpload.error?.message}`);
    }

    // Track uploaded files for potential rollback
    await transaction.addTempAsset('stickers', `stickers/${webpFileName}`);
    await transaction.addTempAsset('stickers', `stickers/${pngFileName}`);

    // Step 6: Get public URLs
    const { data: webpUrlData } = supabaseAdmin.storage
      .from('stickers')
      .getPublicUrl(`stickers/${webpFileName}`);
    
    const { data: pngUrlData } = supabaseAdmin.storage
      .from('stickers')
      .getPublicUrl(`stickers/${pngFileName}`);

    // Step 7: Prepare database record
    const stickerMetadata = generateMetadata(originalName, metadata);
    
    // Generate unique slug to prevent conflicts
    const baseSlug = stickerMetadata.slug;
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Check for slug conflicts and create unique slug
    while (true) {
      const { data: existingSticker } = await supabaseAdmin
        .from('stickers')
        .select('id')
        .eq('slug', uniqueSlug)
        .single();
        
      if (!existingSticker) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const stickerRecord = {
      name: stickerMetadata.name,
      slug: uniqueSlug,
      tags: stickerMetadata.tags,
      file_url: webpUrlData.publicUrl,
      thumbnail_url: webpUrlData.publicUrl,
      file_size: Math.round(webpBuffer.length / 1024), // Size in KB
      file_format: 'webp',
      width: SETTINGS.targetSize,
      height: SETTINGS.targetSize,
      download_count: 0
    };

    // Step 8: Insert to database (no updates, always create new)
    const dbResult = await supabaseAdmin
      .from('stickers')
      .insert(stickerRecord)
      .select()
      .single();

    if (dbResult.error) {
      throw new Error(`Database insert failed: ${dbResult.error.message}`);
    }

    console.log(`✅ Successfully processed: ${originalName} (ID: ${dbResult.data.id})`);

    return {
      originalName,
      fileName: sanitizedName,
      status: 'success',
      webpUrl: webpUrlData.publicUrl,
      pngUrl: pngUrlData.publicUrl, // Still return for UI display
      stickerId: dbResult.data.id,
      metadata: { ...stickerMetadata, slug: uniqueSlug }
    };

  } catch (error) {
    console.error(`❌ Error processing ${originalName}:`, error);
    
    // Individual file failure doesn't rollback entire batch
    // Just track the error for reporting
    return {
      originalName,
      fileName: sanitizedName,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function POST(request: NextRequest) {
  const batchId = randomUUID();
  const transaction = new TransactionManager();
  
  console.log(`🚀 Starting secure batch processing: ${batchId}`);

  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const metadataJson = formData.get('metadata') as string;
    
    let metadata: Record<string, { name?: string; tags?: string[]; slug?: string }> = {};
    if (metadataJson) {
      try {
        metadata = JSON.parse(metadataJson);
      } catch {
        console.warn('Invalid metadata JSON, using auto-generation');
      }
    }

    // Validation
    if (!files || files.length === 0) {
      return NextResponse.json({ 
        error: 'No files provided' 
      }, { status: 400 });
    }

    if (files.length > 20) {
      return NextResponse.json({ 
        error: 'Too many files (max 20 per batch)' 
      }, { status: 400 });
    }

    console.log(`📋 Processing ${files.length} files in secure batch ${batchId}`);

    // Process files with controlled concurrency
    const results: ProcessingResult[] = [];
    let totalSuccessful = 0;
    let totalFailed = 0;
    
    const processFile = async (file: File) => {
      const fileMetadata = metadata[file.name] || null;
      return await processFileToStorage(file, fileMetadata, batchId, transaction);
    };

    // Process files in batches with error isolation
    for (let i = 0; i < files.length; i += SETTINGS.maxConcurrency) {
      const batch = files.slice(i, i + SETTINGS.maxConcurrency);
      const batchPromises = batch.map((file) => 
        processFile(file)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Count successes and failures
        totalSuccessful += batchResults.filter(r => r.status === 'success').length;
        totalFailed += batchResults.filter(r => r.status === 'failed').length;
        
      } catch (batchError) {
        console.error(`❌ Batch ${Math.floor(i / SETTINGS.maxConcurrency) + 1} failed:`, batchError);
        
        // If an entire batch fails, mark all files in that batch as failed
        batch.forEach(file => {
          results.push({
            originalName: file.name,
            fileName: file.name,
            status: 'failed',
            error: `Batch processing error: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`
          });
          totalFailed++;
        });
      }
      
      // Small delay between batches to avoid overwhelming the system
      if (i + SETTINGS.maxConcurrency < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Decision: Commit or Rollback
    const successRate = totalSuccessful / files.length;
    const shouldCommit = totalSuccessful > 0; // Commit if any files succeeded
    
    if (shouldCommit) {
      await transaction.commit();
      console.log(`✅ Batch ${batchId} committed: ${totalSuccessful} success, ${totalFailed} failed`);
    } else {
      await transaction.rollback();
      console.log(`🔄 Batch ${batchId} rolled back: all files failed`);
      
      return NextResponse.json({
        batchId,
        success: false,
        error: 'All files failed processing',
        summary: {
          total: files.length,
          successful: 0,
          failed: totalFailed,
          processedAt: new Date().toISOString(),
          rollback: true
        },
        results: results.map(r => ({
          originalName: r.originalName,
          fileName: r.fileName,
          status: r.status,
          error: r.error
        }))
      }, { status: 422 });
    }

    // Success response
    return NextResponse.json({
      batchId,
      success: true,
      summary: {
        total: files.length,
        successful: totalSuccessful,
        failed: totalFailed,
        successRate: Math.round(successRate * 100),
        processedAt: new Date().toISOString(),
        committed: true
      },
      results: results.map(r => ({
        originalName: r.originalName,
        fileName: r.fileName,
        status: r.status,
        error: r.error,
        stickerId: r.stickerId,
        webpUrl: r.webpUrl,
        pngUrl: r.pngUrl
      })),
      advice: totalFailed > 0 ? 
        `${totalSuccessful} files processed successfully. Review failed files and retry if needed.` :
        `All files processed successfully! Check the gallery to see your new stickers.`
    });

  } catch (error) {
    console.error(`❌ Critical batch processing error:`, error);
    
    // Emergency rollback
    try {
      await transaction.rollback();
      console.log(`🚨 Emergency rollback completed for batch ${batchId}`);
    } catch (rollbackError) {
      console.error(`💥 Emergency rollback failed:`, rollbackError);
    }
    
    return NextResponse.json({
      batchId,
      success: false,
      error: 'Critical processing failure',
      details: error instanceof Error ? error.message : 'Unknown error',
      rollback: true
    }, { status: 500 });
  }
}

// GET endpoint for status checking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      // Return system status
      const [storageStatus, dbStatus] = await Promise.all([
        supabaseAdmin.storage.listBuckets(),
        supabaseAdmin.from('stickers').select('id', { count: 'exact', head: true })
      ]);

      return NextResponse.json({
        status: 'ready',
        storage: storageStatus.error ? 'error' : 'connected',
        database: dbStatus.error ? 'error' : 'connected',
        totalStickers: dbStatus.count || 0,
        lastCheck: new Date().toISOString()
      });
    }

    return NextResponse.json({
      endpoint: '/api/admin/process-sticker-batch',
      methods: ['POST', 'GET'],
      description: 'Atomic sticker processing pipeline',
      maxConcurrency: SETTINGS.maxConcurrency,
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
      outputFormats: ['webp', 'png']
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}