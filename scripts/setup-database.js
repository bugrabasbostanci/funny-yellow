const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🗄️  Setting up database schema...\n');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../lib/database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`[${i + 1}/${statements.length}] Executing SQL statement...`);
      
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: directError } = await supabaseAdmin
            .from('_supabase_admin')
            .select('*')
            .limit(0);
            
          if (directError && directError.code === 'PGRST116') {
            console.log('⚠️  Direct SQL execution not available, continuing...');
          } else {
            console.error(`❌ SQL Error in statement ${i + 1}:`, error);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Skipping statement ${i + 1} (likely already exists)`);
      }
    }
    
    // Test database connection by trying to read from stickers table
    console.log('\n🔍 Testing database connection...');
    
    const { data, error } = await supabaseAdmin
      .from('stickers')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database test failed:', error);
      console.log('\n📋 Manual setup required:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of lib/database.sql');
      console.log('4. Execute the SQL commands manually');
      return false;
    } else {
      console.log('✅ Database connection successful!');
      console.log('✅ Database schema is ready');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    console.log('\n📋 Manual setup required:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of lib/database.sql');
    console.log('4. Execute the SQL commands manually');
    return false;
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database setup completed successfully!');
    console.log('▶️  You can now run: npm run upload-stickers');
  } else {
    console.log('\n⚠️  Manual database setup required');
    console.log('▶️  After manual setup, run: npm run upload-stickers');
  }
});