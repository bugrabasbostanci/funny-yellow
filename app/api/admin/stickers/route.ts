import { NextRequest, NextResponse } from 'next/server';
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

// GET - Fetch all stickers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('stickers')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (tag && tag !== 'all') {
      query = query.contains('tags', [tag]);
    }

    const { data: stickers, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      stickers: stickers || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('GET stickers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update a sticker
export async function PUT(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    // Only allow certain fields to be updated
    const allowedFields = ['name', 'tags', 'slug'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at timestamp
    filteredUpdates.updated_at = new Date().toISOString();

    const { data: sticker, error } = await supabaseAdmin
      .from('stickers')
      .update(filteredUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      sticker 
    });

  } catch (error) {
    console.error('PUT stickers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove a sticker or all stickers
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll');

    // Delete all stickers
    if (deleteAll === 'true') {
      console.log('🚨 DELETE ALL STICKERS operation initiated');
      
      // First get count of stickers to be deleted
      const { count, error: countError } = await supabaseAdmin
        .from('stickers')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Count error:', countError);
        return NextResponse.json({ error: 'Failed to count stickers' }, { status: 500 });
      }

      console.log(`Attempting to delete ${count} stickers`);

      // Delete all stickers
      const { error } = await supabaseAdmin
        .from('stickers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // This will match all records

      if (error) {
        console.error('Delete all error:', error);
        return NextResponse.json({ error: 'Delete all failed' }, { status: 500 });
      }

      console.log(`✅ Successfully deleted all ${count} stickers`);

      return NextResponse.json({ 
        success: true,
        message: 'All stickers deleted successfully',
        deletedCount: count || 0
      });
    }

    // Delete single sticker
    if (!id) {
      return NextResponse.json({ error: 'Sticker ID required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('stickers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Sticker deleted successfully' 
    });

  } catch (error) {
    console.error('DELETE stickers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}