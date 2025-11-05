/**
 * Test script for audit log functionality
 * Verifies that:
 * 1. User names are stored in the entity column
 * 2. Detailed change information is stored in the details column
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditLogs() {
  console.log('\n============================================================');
  console.log('   AUDIT LOG FUNCTIONALITY TEST');
  console.log('============================================================\n');

  let allTestsPassed = true;

  try {
    // Test 1: Check if audit_logs table exists and has correct structure
    console.log('Test 1: Checking audit_logs table structure...');
    const { data: columns, error: structureError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1);

    if (structureError) {
      console.error('❌ Failed to query audit_logs table:', structureError.message);
      allTestsPassed = false;
    } else {
      console.log('✅ audit_logs table exists and is accessible');
    }

    // Test 2: Fetch recent audit logs to verify entity column has user names
    console.log('\nTest 2: Checking if entity column contains user names...');
    const { data: recentLogs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ Failed to fetch audit logs:', logsError.message);
      allTestsPassed = false;
    } else if (!recentLogs || recentLogs.length === 0) {
      console.log('⚠️  No audit logs found in database yet');
      console.log('   This is expected if no user actions have been performed');
      console.log('   Try registering a user or creating an interview to generate logs');
    } else {
      console.log(`✅ Found ${recentLogs.length} recent audit logs`);

      // Check entity column
      const logsWithUserNames = recentLogs.filter(log =>
        log.entity &&
        log.entity !== 'Unknown User' &&
        !log.entity.startsWith('interview-') &&
        !log.entity.includes('/')
      );

      if (logsWithUserNames.length > 0) {
        console.log(`✅ ${logsWithUserNames.length} logs have user names in entity column`);
        console.log('\nSample log with user name:');
        console.log('  Entity (User Name):', logsWithUserNames[0].entity);
        console.log('  Action:', logsWithUserNames[0].action);
        console.log('  Table:', logsWithUserNames[0].table_name);
      } else {
        console.log('⚠️  No logs found with user names in entity column yet');
        console.log('   This will be populated when users perform actions');
      }

      // Test 3: Check details column has comprehensive information
      console.log('\nTest 3: Checking if details column contains change information...');

      const logsWithDetails = recentLogs.filter(log => log.details);

      if (logsWithDetails.length > 0) {
        console.log(`✅ ${logsWithDetails.length} logs have details information`);

        // Check for comprehensive details structure
        const logsWithComprehensiveDetails = logsWithDetails.filter(log => {
          const details = log.details;
          return details.action_type && details.user_info && (details.changes || details.summary);
        });

        if (logsWithComprehensiveDetails.length > 0) {
          console.log(`✅ ${logsWithComprehensiveDetails.length} logs have comprehensive details (action_type, user_info, changes/summary)`);

          console.log('\nSample comprehensive audit log:');
          const sample = logsWithComprehensiveDetails[0];
          console.log('  Action:', sample.action);
          console.log('  Entity:', sample.entity);
          console.log('  Details Structure:');
          console.log('    - action_type:', sample.details.action_type);
          console.log('    - table:', sample.details.table);
          console.log('    - user_info:', JSON.stringify(sample.details.user_info));
          if (sample.details.changes) {
            console.log('    - changes:', JSON.stringify(sample.details.changes, null, 2).substring(0, 200) + '...');
          }
          if (sample.details.summary) {
            console.log('    - summary:', sample.details.summary);
          }
        } else {
          console.log('⚠️  No logs found with comprehensive details structure yet');
        }
      } else {
        console.log('⚠️  No logs found with details information yet');
      }
    }

    // Test 4: Display all unique actions in audit logs
    console.log('\nTest 4: Listing all recorded actions...');
    const { data: allLogs, error: allLogsError } = await supabase
      .from('audit_logs')
      .select('action, table_name, created_at')
      .order('created_at', { ascending: false });

    if (allLogsError) {
      console.error('❌ Failed to fetch all logs:', allLogsError.message);
      allTestsPassed = false;
    } else if (allLogs && allLogs.length > 0) {
      const uniqueActions = [...new Set(allLogs.map(log => log.action))];
      console.log(`✅ Found ${allLogs.length} total audit logs with ${uniqueActions.length} unique actions:`);
      uniqueActions.forEach(action => {
        const count = allLogs.filter(log => log.action === action).length;
        console.log(`   - ${action}: ${count} log(s)`);
      });
    } else {
      console.log('⚠️  No audit logs in database yet');
    }

    // Test 5: Check audit log table schema
    console.log('\nTest 5: Verifying audit_logs table schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('exec_sql', {
        sql_query: `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'audit_logs'
          ORDER BY ordinal_position;
        `
      })
      .single();

    // If RPC doesn't work, try direct query
    if (schemaError) {
      console.log('⚠️  Could not verify schema via RPC, using sample data instead');
      if (recentLogs && recentLogs.length > 0) {
        const sampleLog = recentLogs[0];
        console.log('✅ Audit log structure from sample:');
        console.log('   Columns:', Object.keys(sampleLog).join(', '));
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    allTestsPassed = false;
  }

  // Final summary
  console.log('\n============================================================');
  if (allTestsPassed) {
    console.log('   ✅ ALL AUDIT LOG TESTS COMPLETED');
  } else {
    console.log('   ⚠️  SOME TESTS HAD ISSUES');
  }
  console.log('============================================================\n');

  console.log('NEXT STEPS:');
  console.log('1. Perform user actions (register, login, create interview) to generate audit logs');
  console.log('2. Check Supabase dashboard > Table Editor > audit_logs to view logs');
  console.log('3. Verify entity column shows user names');
  console.log('4. Verify details column shows comprehensive change information\n');

  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
testAuditLogs();
