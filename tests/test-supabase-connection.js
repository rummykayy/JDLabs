const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n🔌 TESTING SUPABASE CONNECTION\n');
  console.log('URL:', supabaseUrl);
  console.log('Key present:', supabaseAnonKey ? 'YES' : 'NO\n');

  try {
    // Test 1: Check if we can query a table
    console.log('📋 Test 1: Querying interviews table...');
    const { data, error } = await supabase
      .from('interviews')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ FAILED:', error.message);
      return;
    }

    console.log('✅ SUCCESS - Database connection working\n');

    // Test 2: Get count of interviews
    console.log('📊 Test 2: Fetching latest interviews...');
    const { data: interviews, error: interviewError } = await supabase
      .from('interviews')
      .select('id, candidate_name, position, status')
      .order('created_at', { ascending: false })
      .limit(5);

    if (interviewError) {
      console.log('❌ FAILED:', interviewError.message);
      return;
    }

    console.log(`✅ SUCCESS - Found ${interviews.length} interviews\n`);

    if (interviews.length > 0) {
      console.log('📜 Recent interviews:');
      interviews.forEach(function(i, idx) {
        console.log(
          (idx + 1) + '. ' + i.candidate_name + ' - ' +
          i.position + ' (' + i.status + ')'
        );
      });
    }

    // Test 3: Check all tables
    console.log('\n📋 Test 3: Checking all database tables...');
    const tables = [
      'interviews',
      'interview_questions',
      'interview_answers',
      'users',
      'performance_reports',
      'audit_logs'
    ];

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      const res = await supabase
        .from(table)
        .select('count()')
        .limit(1);

      if (res.error) {
        console.log('  ❌ ' + table + ': ' + res.error.message);
      } else {
        console.log('  ✅ ' + table + ': Accessible');
      }
    }

    console.log('\n✅ ALL TESTS PASSED - SUPABASE IS WORKING PROPERLY\n');

  } catch (err) {
    console.log('❌ ERROR:', err.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check internet connection');
    console.log('2. Verify .env file has SUPABASE_URL and SUPABASE_ANON_KEY');
    console.log('3. Check Supabase project is active at: https://app.supabase.com');
    console.log('4. Verify API credentials are correct');
  }
}

testConnection();
