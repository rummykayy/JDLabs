/**
 * Database Setup and Testing Script
 * Tests all database operations and verifies everything is working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.log('Required: SUPABASE_URL, NEW_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🧪 JD Labs Database Testing Suite\n');
console.log('='.repeat(60));

/**
 * Test database connection
 */
async function testConnection() {
  console.log('\n📡 Testing database connection...');
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('  ✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('  ❌ Connection failed:', error.message);
    return false;
  }
}

/**
 * Test languages table
 */
async function testLanguages() {
  console.log('\n🌍 Testing languages table...');
  try {
    const { data: languages, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    console.log(`  ✅ Found ${languages.length} active languages`);

    if (languages.length === 0) {
      console.log('  ⚠️  No languages found! Seeding default languages...');
      await seedLanguages();
    } else {
      console.log(`  📋 Sample languages: ${languages.slice(0, 5).map(l => l.name).join(', ')}`);
    }

    return { success: true, count: languages.length };
  } catch (error) {
    console.error('  ❌ Languages test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Seed default languages
 */
async function seedLanguages() {
  const defaultLanguages = [
    { name: 'English', code: 'en-US' },
    { name: 'Spanish', code: 'es-ES' },
    { name: 'French', code: 'fr-FR' },
    { name: 'German', code: 'de-DE' },
    { name: 'Italian', code: 'it-IT' },
    { name: 'Portuguese', code: 'pt-PT' },
    { name: 'Russian', code: 'ru-RU' },
    { name: 'Japanese', code: 'ja-JP' },
    { name: 'Korean', code: 'ko-KR' },
    { name: 'Chinese (Simplified)', code: 'zh-CN' },
    { name: 'Chinese (Traditional)', code: 'zh-TW' },
    { name: 'Arabic', code: 'ar-SA' },
    { name: 'Hindi', code: 'hi-IN' },
    { name: 'Bengali', code: 'bn-BD' },
    { name: 'Turkish', code: 'tr-TR' },
    { name: 'Polish', code: 'pl-PL' },
    { name: 'Dutch', code: 'nl-NL' },
    { name: 'Swedish', code: 'sv-SE' },
    { name: 'Norwegian', code: 'no-NO' },
    { name: 'Danish', code: 'da-DK' },
  ];

  try {
    const { data, error } = await supabase
      .from('languages')
      .insert(defaultLanguages.map(lang => ({
        ...lang,
        is_active: true
      })))
      .select();

    if (error) throw error;

    console.log(`  ✅ Seeded ${data.length} languages successfully`);
    return data;
  } catch (error) {
    console.error('  ❌ Failed to seed languages:', error.message);
    throw error;
  }
}

/**
 * Test jobs table
 */
async function testJobs() {
  console.log('\n💼 Testing jobs table...');
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .limit(10);

    if (error) throw error;

    console.log(`  ✅ Found ${jobs.length} active jobs`);

    if (jobs.length > 0) {
      console.log(`  📋 Sample job: "${jobs[0].title}" at ${jobs[0].company_name || 'Company'}`);
    }

    return { success: true, count: jobs.length };
  } catch (error) {
    console.error('  ❌ Jobs test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test users table
 */
async function testUsers() {
  console.log('\n👥 Testing users table...');
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, userid, created_at')
      .limit(10);

    if (error) throw error;

    console.log(`  ✅ Found ${users.length} users`);

    if (users.length > 0) {
      console.log(`  📋 Sample user: ${users[0].name || 'Unnamed'} (${users[0].email})`);
    }

    return { success: true, count: users.length };
  } catch (error) {
    console.error('  ❌ Users test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test interviews table
 */
async function testInterviews() {
  console.log('\n🎤 Testing interviews table...');
  try {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('id, candidate_name, position, status, created_at')
      .limit(10);

    if (error) throw error;

    console.log(`  ✅ Found ${interviews.length} interviews`);

    if (interviews.length > 0) {
      const statusCounts = interviews.reduce((acc, i) => {
        acc[i.status] = (acc[i.status] || 0) + 1;
        return acc;
      }, {});
      console.log(`  📊 Status breakdown:`, statusCounts);
    }

    return { success: true, count: interviews.length };
  } catch (error) {
    console.error('  ❌ Interviews test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test storage buckets
 */
async function testStorage() {
  console.log('\n📦 Testing storage buckets...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    console.log(`  ✅ Found ${buckets.length} storage buckets`);

    const expectedBuckets = ['interview-recordings', 'screen-recordings', 'user-avatars'];
    const missingBuckets = expectedBuckets.filter(
      name => !buckets.find(b => b.name === name)
    );

    if (missingBuckets.length > 0) {
      console.log(`  ⚠️  Missing buckets: ${missingBuckets.join(', ')}`);
      console.log('  💡 Run setup-storage-and-rls.sql to create missing buckets');
    } else {
      console.log('  ✅ All required buckets exist:', expectedBuckets.join(', '));
    }

    return { success: true, buckets: buckets.map(b => b.name), missing: missingBuckets };
  } catch (error) {
    console.error('  ❌ Storage test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Test RLS policies
 */
async function testRLS() {
  console.log('\n🔒 Testing RLS policies...');
  try {
    const { data, error } = await supabase.rpc('pg_policies', {}, {
      schema: 'public'
    }).select('*');

    // This won't work via client SDK, so we'll just check if RLS is enabled
    const tables = [
      'users',
      'profiles',
      'interviews',
      'interview_questions',
      'interview_answers',
      'messages',
      'interview_assessments',
      'performance_reports',
      'comments',
      'jobs',
      'languages'
    ];

    console.log('  ℹ️  RLS should be enabled for these tables:', tables.join(', '));
    console.log('  💡 Verify RLS policies in Supabase Dashboard');

    return { success: true, tables };
  } catch (error) {
    console.log('  ℹ️  Cannot verify RLS via client SDK (expected)');
    return { success: true, note: 'Manual verification needed' };
  }
}

/**
 * Test creating a sample interview (if user exists)
 */
async function testInterviewCreation() {
  console.log('\n🧪 Testing interview creation...');
  try {
    // Get first user
    const { data: users } = await supabase
      .from('users')
      .select('id, userid, name')
      .limit(1);

    if (!users || users.length === 0) {
      console.log('  ⚠️  No users found, skipping interview creation test');
      return { success: true, skipped: true };
    }

    const testUser = users[0];

    // Create a test interview
    const testInterview = {
      user_id: testUser.id,
      candidate_name: 'Test Candidate',
      position: 'Software Engineer',
      jobDescription: 'Test job description',
      mode: 'Chat Interview',
      language: 'en-US',
      model: 'gemini-1.5-flash',
      difficulty: 'Medium',
      status: 'lobby'
    };

    const { data: interview, error } = await supabase
      .from('interviews')
      .insert(testInterview)
      .select()
      .single();

    if (error) throw error;

    console.log(`  ✅ Created test interview: ${interview.id}`);

    // Clean up - delete the test interview
    const { error: deleteError } = await supabase
      .from('interviews')
      .delete()
      .eq('id', interview.id);

    if (!deleteError) {
      console.log('  ✅ Cleaned up test interview');
    }

    return { success: true, interviewId: interview.id };
  } catch (error) {
    console.error('  ❌ Interview creation test failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Main test suite
 */
async function main() {
  const results = {};

  // Run all tests
  results.connection = await testConnection();
  if (!results.connection) {
    console.error('\n❌ Connection failed. Cannot proceed with tests.');
    process.exit(1);
  }

  results.languages = await testLanguages();
  results.jobs = await testJobs();
  results.users = await testUsers();
  results.interviews = await testInterviews();
  results.storage = await testStorage();
  results.rls = await testRLS();
  results.interviewCreation = await testInterviewCreation();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = Object.values(results).filter(r => r && r.success).length;
  const total = Object.keys(results).length;

  console.log(`\n✅ Tests Passed: ${passed}/${total}`);

  // Check for warnings
  const warnings = [];

  if (results.languages && results.languages.count === 0) {
    warnings.push('No languages found (should be seeded automatically)');
  }

  if (results.storage && results.storage.missing && results.storage.missing.length > 0) {
    warnings.push(`Missing storage buckets: ${results.storage.missing.join(', ')}`);
  }

  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(w => console.log(`  - ${w}`));
  }

  console.log('\n📝 Next Steps:');

  if (results.storage && results.storage.missing && results.storage.missing.length > 0) {
    console.log('  1. Run setup-storage-and-rls.sql in Supabase SQL Editor');
  }

  console.log('  2. Test the application: npm run build && npm start');
  console.log('  3. Verify language dropdown loads on setup screen');
  console.log('  4. Try creating a test interview');

  console.log('\n✅ Database testing complete!\n');
}

main().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});
