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

async function resetDownloadCounts() {
  try {
    console.log('🔄 Resetting download counts to 0...');

    const { data, error } = await supabase
      .from('stickers')
      .update({ download_count: 0 })
      .gt('download_count', 0) // Only update stickers that have downloads > 0
      .select('id, name, download_count');

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully reset download counts for ${data.length} stickers`);
    
    // Show a few examples
    if (data.length > 0) {
      console.log('\n📊 Examples:');
      data.slice(0, 5).forEach(sticker => {
        console.log(`   - ${sticker.name}: ${sticker.download_count} downloads`);
      });
      
      if (data.length > 5) {
        console.log(`   - ... and ${data.length - 5} more stickers`);
      }
    }

  } catch (error) {
    console.error('❌ Error resetting download counts:', error.message);
    process.exit(1);
  }
}

// Run the reset
resetDownloadCounts();