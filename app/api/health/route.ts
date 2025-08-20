import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  try {
    // Check database connection
    const { error } = await supabase
      .from('stickers')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    // Check if we can read from storage (optional)
    const { data: bucketData } = await supabase.storage.listBuckets();
    const hasStorageBucket = bucketData?.some(bucket => bucket.name === 'stickers') || false;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      storage: hasStorageBucket ? 'connected' : 'warning',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}