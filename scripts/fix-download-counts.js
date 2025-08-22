#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixDownloadCounts() {
  try {
    console.log('🔄 Fixing download counts based on actual downloads table...');

    // Get all stickers
    const { data: stickers, error: stickersError } = await supabase
      .from('stickers')
      .select('id, name, download_count')
      .order('name');

    if (stickersError) {
      throw stickersError;
    }

    console.log(`📊 Found ${stickers.length} stickers to check`);

    let fixedCount = 0;
    let mismatchCount = 0;

    for (const sticker of stickers) {
      // Get actual download count from downloads table
      // Using select + length for better consistency
      const { data: downloadRecords, error: countError } = await supabase
        .from('downloads')
        .select('id')
        .eq('sticker_id', sticker.id);

      if (countError) {
        console.error(`❌ Error fetching downloads for ${sticker.name}:`, countError);
        continue;
      }

      const actualDownloadCount = downloadRecords?.length || 0;
      const currentDownloadCount = sticker.download_count || 0;

      if (actualDownloadCount !== currentDownloadCount) {
        mismatchCount++;
        console.log(`🔧 Fixing ${sticker.name}: ${currentDownloadCount} → ${actualDownloadCount}`);

        // Update sticker with correct count
        const { error: updateError } = await supabase
          .from('stickers')
          .update({ download_count: actualDownloadCount })
          .eq('id', sticker.id);

        if (updateError) {
          console.error(`❌ Error updating ${sticker.name}:`, updateError);
        } else {
          fixedCount++;
        }
      }
    }

    console.log(`\n✅ Download count fix completed:`);
    console.log(`   📊 Total stickers checked: ${stickers.length}`);
    console.log(`   🔧 Mismatches found: ${mismatchCount}`);
    console.log(`   ✅ Successfully fixed: ${fixedCount}`);

    if (mismatchCount === 0) {
      console.log(`\n🎉 All download counts are already correct!`);
    } else {
      console.log(`\n📈 Download counts have been synchronized with downloads table`);
    }

  } catch (error) {
    console.error('❌ Error fixing download counts:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixDownloadCounts();