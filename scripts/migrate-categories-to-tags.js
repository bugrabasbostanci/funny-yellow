const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function migrateCategoriestoTags() {
  try {
    console.log('🔄 Starting category to tags migration...');

    // Fetch all stickers
    const { data: stickers, error } = await supabaseAdmin
      .from('stickers')
      .select('*');

    if (error) {
      throw error;
    }

    console.log(`📦 Found ${stickers.length} stickers to process`);

    let updatedCount = 0;

    for (const sticker of stickers) {
      // Check if category is already in tags
      const currentTags = sticker.tags || [];
      const category = sticker.category;

      if (category && !currentTags.includes(category)) {
        // Add category to tags if not already present
        const updatedTags = [...currentTags, category];

        const { error: updateError } = await supabaseAdmin
          .from('stickers')
          .update({ tags: updatedTags })
          .eq('id', sticker.id);

        if (updateError) {
          console.error(`❌ Failed to update sticker ${sticker.name}:`, updateError);
        } else {
          console.log(`✅ Updated ${sticker.name} - added "${category}" to tags`);
          updatedCount++;
        }
      } else {
        console.log(`⏭️  Skipped ${sticker.name} - category "${category}" already in tags or no category`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`🎉 Migration completed! Updated ${updatedCount} stickers`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateCategoriestoTags();