// Check Row Level Security Policies
const { createClient } = require('@supabase/supabase-js');

async function checkRLS() {
  const supabase = createClient(
    'https://ctsqmhhjacigvhmhndhh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0'
  );

  console.log('🔒 ROW LEVEL SECURITY (RLS) POLICIES CHECK');
  console.log('='.repeat(70));
  console.log();

  const tables = [
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

  console.log('Testing RLS by attempting to query without authentication...\n');

  for (const tableName of tables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: false })
        .limit(1);

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
          console.log(`✅ ${tableName.padEnd(25)} - RLS ENABLED (blocking access as expected)`);
        } else if (error.code === '42501') {
          console.log(`✅ ${tableName.padEnd(25)} - RLS ENABLED (permission denied)`);
        } else {
          console.log(`⚠️  ${tableName.padEnd(25)} - Error: ${error.message}`);
        }
      } else if (data) {
        if (data.length > 0 || count > 0) {
          console.log(`❌ ${tableName.padEnd(25)} - RLS DISABLED or TOO PERMISSIVE (data accessible without proper auth)`);
        } else {
          console.log(`⚠️  ${tableName.padEnd(25)} - Table empty, cannot determine RLS status`);
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName.padEnd(25)} - Error: ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📝 NOTES:');
  console.log('='.repeat(70));
  console.log('✅ RLS ENABLED = Good! Policies are protecting the data');
  console.log('❌ RLS DISABLED = Bad! Data is accessible to anyone');
  console.log('⚠️  Cannot determine = Table might be empty or misconfigured');
  console.log();
  console.log('If tables show as accessible without auth, you need to:');
  console.log('1. Enable RLS on the table');
  console.log('2. Create appropriate policies for authenticated users');
  console.log('='.repeat(70));
}

checkRLS()
  .then(() => {
    console.log('\n✨ RLS check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 RLS check failed:', error);
    process.exit(1);
  });
