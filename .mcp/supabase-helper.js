/**
 * PROJECT-LOCAL SUPABASE HELPER
 * Provides MCP-like functionality for database operations
 * Can be used until MCP servers are active
 */

const { createClient } = require('@supabase/supabase-js');

// Load configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ctsqmhhjacigvhmhndhh.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * List all tables in the public schema
 */
async function listTables() {
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

  console.log('📋 Available Tables:');
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`   ❌ ${table} - Error: ${error.message}`);
    } else {
      console.log(`   ✅ ${table} (${count || 0} rows)`);
    }
  }
}

/**
 * Get schema information for a table
 */
async function getTableSchema(tableName) {
  console.log(`\n📊 Schema for table: ${tableName}`);
  console.log('='.repeat(70));

  // Get sample row to infer schema
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return;
  }

  if (!data || data.length === 0) {
    console.log('⚠️  Table is empty - cannot infer schema');
    console.log('ℹ️  Expected columns based on codebase:');

    const schemas = {
      users: ['id', 'userid', 'email', 'name', 'created_at', 'updated_at'],
      interviews: ['id', 'user_id', 'candidate_name', 'position', 'jobDescription', 'mode', 'language', 'model', 'difficulty', 'status', 'started_at', 'ended_at', 'duration_minutes', 'overall_score', 'video_url', 'malpractice_report', 'created_at', 'updated_at'],
      interview_questions: ['id', 'interview_id', 'question_text', 'question_order', 'asked_at', 'created_at'],
      interview_answers: ['id', 'question_id', 'answer_text', 'answer_audio_url', 'answer_video_url', 'duration_seconds', 'created_at', 'updated_at'],
      performance_reports: ['id', 'interview_id', 'candidate_id', 'interviewer_id', 'overall_score', 'technical_score', 'communication_score', 'problem_solving_score', 'feedback', 'recommendation', 'created_at', 'updated_at'],
      comments: ['id', 'interview_id', 'user_id', 'comment_text', 'is_internal', 'created_at', 'updated_at'],
      jobs: ['id', 'title', 'description', 'company_name', 'location', 'employment_type', 'salary_range', 'requirements', 'created_by', 'is_active', 'created_at', 'updated_at'],
      languages: ['id', 'name', 'code', 'is_active', 'created_at'],
      audit_logs: ['id', 'user_id', 'action', 'entity', 'entity_id', 'table_name', 'details', 'created_at'],
      screen_shares: ['id', 'interview_id', 'recording_url', 'started_at', 'ended_at', 'duration_seconds', 'file_size_mb', 'created_at']
    };

    if (schemas[tableName]) {
      console.log('\nColumns:', schemas[tableName].join(', '));
    }
    return;
  }

  console.log('\nColumns:');
  const sample = data[0];
  Object.entries(sample).forEach(([key, value]) => {
    const type = typeof value === 'object' && value !== null ? 'JSON' : typeof value;
    console.log(`   - ${key}: ${type}`);
  });
}

/**
 * Execute a custom SQL query (SELECT only for safety)
 */
async function queryDatabase(tableName, filters = {}, limit = 10) {
  console.log(`\n🔍 Querying table: ${tableName}`);
  console.log('='.repeat(70));

  let query = supabase.from(tableName).select('*');

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });

  query = query.limit(limit);

  const { data, error, count } = await query;

  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return null;
  }

  console.log(`✅ Found ${data.length} row(s)`);

  if (data.length > 0) {
    console.log('\nResults:');
    data.forEach((row, idx) => {
      console.log(`\n📄 Row ${idx + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 60
          ? value.substring(0, 60) + '...'
          : value;
        console.log(`   ${key}: ${displayValue}`);
      });
    });
  }

  return data;
}

/**
 * Get table statistics
 */
async function getTableStats(tableName) {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });

  if (error) {
    return { tableName, count: null, error: error.message };
  }

  return { tableName, count, error: null };
}

/**
 * Check RLS status (by attempting unauthenticated access)
 */
async function checkRLSStatus() {
  console.log('\n🔒 Checking Row Level Security Status...');
  console.log('='.repeat(70));

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

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (error && (error.code === 'PGRST116' || error.code === '42501')) {
      console.log(`   ✅ ${table.padEnd(25)} - RLS ENABLED`);
    } else if (error) {
      console.log(`   ⚠️  ${table.padEnd(25)} - ${error.message}`);
    } else if (data && data.length > 0) {
      console.log(`   ❌ ${table.padEnd(25)} - RLS DISABLED (data accessible)`);
    } else {
      console.log(`   ⚠️  ${table.padEnd(25)} - Empty table (cannot verify)`);
    }
  }
}

/**
 * Check storage buckets
 */
async function listStorageBuckets() {
  console.log('\n💾 Storage Buckets:');
  console.log('='.repeat(70));

  const { data: buckets, error } = await supabase.storage.listBuckets();

  if (error) {
    console.log(`❌ Error: ${error.message}`);
    return;
  }

  if (!buckets || buckets.length === 0) {
    console.log('⚠️  No storage buckets found');
    console.log('ℹ️  You need to create "interview-recordings" bucket');
    return;
  }

  buckets.forEach(bucket => {
    console.log(`\n📦 ${bucket.name}`);
    console.log(`   ID: ${bucket.id}`);
    console.log(`   Public: ${bucket.public ? 'Yes' : 'No'}`);
    console.log(`   Created: ${bucket.created_at}`);
  });
}

/**
 * Full database inspection
 */
async function inspect() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 SUPABASE DATABASE INSPECTION');
  console.log('='.repeat(70));

  await listTables();
  await checkRLSStatus();
  await listStorageBuckets();

  console.log('\n' + '='.repeat(70));
  console.log('✨ Inspection complete!');
  console.log('='.repeat(70));
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];

  (async () => {
    switch (command) {
      case 'list':
      case 'tables':
        await listTables();
        break;

      case 'schema':
        if (!arg1) {
          console.log('Usage: node supabase-helper.js schema <table_name>');
          process.exit(1);
        }
        await getTableSchema(arg1);
        break;

      case 'query':
        if (!arg1) {
          console.log('Usage: node supabase-helper.js query <table_name> [limit]');
          process.exit(1);
        }
        await queryDatabase(arg1, {}, parseInt(arg2) || 10);
        break;

      case 'rls':
        await checkRLSStatus();
        break;

      case 'buckets':
        await listStorageBuckets();
        break;

      case 'inspect':
      default:
        await inspect();
        break;
    }
  })().then(() => process.exit(0)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
}

// Export for use as module
module.exports = {
  supabase,
  listTables,
  getTableSchema,
  queryDatabase,
  getTableStats,
  checkRLSStatus,
  listStorageBuckets,
  inspect
};
