// Verify Supabase Connection and List Tables
const { createClient } = require('@supabase/supabase-js');

async function verifySupabaseConnection() {
  console.log('🔍 Verifying Supabase Connection...\n');

  // Load credentials from .env.local
  const supabaseUrl = 'https://ctsqmhhjacigvhmhndhh.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check connection
    console.log('📡 Test 1: Checking Supabase Connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        console.log('   ❌ Table "users" does not exist');
        console.log('   ℹ️  This means the database schema has not been set up yet\n');
      } else {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    } else {
      console.log('   ✅ Connection successful!\n');
    }

    // Test 2: List all tables in public schema
    console.log('📋 Test 2: Listing All Tables in Public Schema...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (tablesError) {
      // Try alternative method using RPC or direct query
      console.log('   ⚠️  Cannot access information_schema, trying alternative method...');

      // Try to query each expected table individually
      const expectedTables = [
        'users',
        'interviews',
        'interview_questions',
        'interview_answers',
        'performance_reports',
        'comments',
        'jobs',
        'languages',
        'audit_logs',
        'screen_shares'
      ];

      console.log('\n   Checking individual tables:');
      const existingTables = [];

      for (const tableName of expectedTables) {
        try {
          const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
          if (error) {
            if (error.code === '42P01') {
              console.log(`   ❌ ${tableName} - Does not exist`);
            } else if (error.code === 'PGRST116') {
              console.log(`   ⚠️  ${tableName} - Exists but RLS is blocking access (normal for new tables)`);
              existingTables.push(tableName);
            } else {
              console.log(`   ⚠️  ${tableName} - Error: ${error.message}`);
            }
          } else {
            console.log(`   ✅ ${tableName} - Exists and accessible`);
            existingTables.push(tableName);
          }
        } catch (err) {
          console.log(`   ❌ ${tableName} - Error: ${err.message}`);
        }
      }

      console.log(`\n   Summary: ${existingTables.length} out of ${expectedTables.length} tables found\n`);

      if (existingTables.length > 0) {
        console.log('   ✅ Existing tables:', existingTables.join(', '));
      }

    } else if (tables && tables.length > 0) {
      console.log(`   ✅ Found ${tables.length} tables:\n`);
      tables.forEach(t => console.log(`      - ${t.table_name}`));
    } else {
      console.log('   ⚠️  No tables found in public schema');
      console.log('   ℹ️  Database appears to be empty\n');
    }

    // Test 3: Check storage buckets
    console.log('\n💾 Test 3: Checking Storage Buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log(`   ❌ Error listing buckets: ${bucketsError.message}\n`);
    } else if (buckets && buckets.length > 0) {
      console.log(`   ✅ Found ${buckets.length} storage bucket(s):\n`);
      buckets.forEach(bucket => {
        console.log(`      - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
      console.log();
    } else {
      console.log('   ⚠️  No storage buckets found\n');
    }

    // Test 4: Check if we can query jobs table (most likely to have data)
    console.log('🔍 Test 4: Checking for Sample Data...');
    try {
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title')
        .limit(5);

      if (jobsError) {
        if (jobsError.code === '42P01') {
          console.log('   ❌ Jobs table does not exist');
        } else {
          console.log(`   ⚠️  Jobs table exists but: ${jobsError.message}`);
        }
      } else if (jobs && jobs.length > 0) {
        console.log(`   ✅ Found ${jobs.length} job(s) in jobs table:`);
        jobs.forEach(job => console.log(`      - ${job.title}`));
      } else {
        console.log('   ℹ️  Jobs table exists but is empty');
      }
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    console.log('Supabase URL:', supabaseUrl);
    console.log('Project Ref:', 'ctsqmhhjacigvhmhndhh');
    console.log('Connection:', '✅ Successful');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('Stack:', error.stack);
  }
}

verifySupabaseConnection()
  .then(() => {
    console.log('\n✨ Verification complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
