import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET() {
  try {
    // Get total sticker count
    const { count: totalStickers, error: countError } = await supabaseAdmin
      .from('stickers')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Count error:', countError);
      return NextResponse.json({ error: 'Failed to get sticker count' }, { status: 500 });
    }

    // Get total download count
    const { data: downloadData, error: downloadError } = await supabaseAdmin
      .from('stickers')
      .select('download_count');

    if (downloadError) {
      console.error('Download count error:', downloadError);
      return NextResponse.json({ error: 'Failed to get download counts' }, { status: 500 });
    }

    const totalDownloads = downloadData?.reduce((sum, sticker) => sum + (sticker.download_count || 0), 0) || 0;

    // Get unique tags count
    const { data: tagData, error: tagError } = await supabaseAdmin
      .from('stickers')
      .select('tags');

    if (tagError) {
      console.error('Tags error:', tagError);
      return NextResponse.json({ error: 'Failed to get tags' }, { status: 500 });
    }

    const uniqueTags = new Set<string>();
    tagData?.forEach(sticker => {
      if (Array.isArray(sticker.tags)) {
        sticker.tags.forEach(tag => uniqueTags.add(tag));
      }
    });

    // Get recent uploads (last 5)
    const { data: recentUploads, error: recentError } = await supabaseAdmin
      .from('stickers')
      .select('id, name, created_at, download_count')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Recent uploads error:', recentError);
      return NextResponse.json({ error: 'Failed to get recent uploads' }, { status: 500 });
    }

    // Get popular stickers (top 5 by downloads)
    const { data: popularStickers, error: popularError } = await supabaseAdmin
      .from('stickers')
      .select('id, name, download_count')
      .order('download_count', { ascending: false })
      .limit(5);

    if (popularError) {
      console.error('Popular stickers error:', popularError);
      return NextResponse.json({ error: 'Failed to get popular stickers' }, { status: 500 });
    }

    return NextResponse.json({
      stats: {
        totalStickers: totalStickers || 0,
        totalDownloads,
        uniqueTags: uniqueTags.size,
        averageDownloads: totalStickers ? Math.round(totalDownloads / totalStickers) : 0
      },
      recentUploads: recentUploads || [],
      popularStickers: popularStickers || []
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}