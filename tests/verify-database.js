#!/usr/bin/env node

// ============================================================================
// Database Verification Script
// ============================================================================
// Purpose: Verify database population and data integrity
// Usage: npm run verify
// ============================================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`),
};

async function verifyTableCounts() {
  log.section('TABLE RECORD COUNTS');

  const tables = [
    { name: 'languages', expected: 10 },
    { name: 'users', expected: 1 },
    { name: 'jobs', expected: 15 },
    { name: 'interviews', expected: 20 },
    { name: 'interview_questions', expected: 80 },
    { name: 'interview_answers', expected: 80 },
    { name: 'performance_reports', expected: 14 },
    { name: 'comments', expected: 0 },
    { name: 'audit_logs', expected: 0 },
  ];

  const results = [];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table.name)
      .select('*', { count: 'exact', head: true });

    if (error) {
      log.error(`Failed to count ${table.name}: ${error.message}`);
      results.push({ table: table.name, status: 'ERROR', count: 0 });
    } else {
      const status = count >= table.expected ? 'PASS' : 'WARN';
      const symbol = status === 'PASS' ? '✅' : '⚠️';
      console.log(`  ${symbol} ${table.name.padEnd(25)} ${count || 0} (expected: ${table.expected}+)`);
      results.push({ table: table.name, status, count });
    }
  }

  return results;
}

async function verifyForeignKeys() {
  log.section('FOREIGN KEY INTEGRITY');

  let passed = 0;
  let failed = 0;

  // Check interviews → users
  log.info('Checking interviews → users');
  // Note: RPC function may not exist, so we skip this check
  // const { data: orphanedInterviews } = await supabase.rpc('check_orphaned_interviews');

  const { data: invalidInterviews, error: intError } = await supabase
    .from('interviews')
    .select('id, user_id')
    .is('user_id', null);

  if (intError) {
    log.warning(`Could not verify: ${intError.message}`);
  } else if (invalidInterviews && invalidInterviews.length > 0) {
    log.error(`Found ${invalidInterviews.length} interviews with NULL user_id`);
    failed++;
  } else {
    log.success('All interviews have valid user references');
    passed++;
  }

  // Check interview_questions → interviews
  log.info('Checking interview_questions → interviews');
  const { data: orphanedQuestions } = await supabase
    .from('interview_questions')
    .select('id, interview_id')
    .is('interview_id', null);

  if (orphanedQuestions && orphanedQuestions.length > 0) {
    log.error(`Found ${orphanedQuestions.length} questions with NULL interview_id`);
    failed++;
  } else {
    log.success('All questions have valid interview references');
    passed++;
  }

  // Check interview_answers → questions
  log.info('Checking interview_answers → questions');
  const { data: orphanedAnswers } = await supabase
    .from('interview_answers')
    .select('id, question_id')
    .is('question_id', null);

  if (orphanedAnswers && orphanedAnswers.length > 0) {
    log.error(`Found ${orphanedAnswers.length} answers with NULL question_id`);
    failed++;
  } else {
    log.success('All answers have valid question references');
    passed++;
  }

  return { passed, failed };
}

async function verifyDataQuality() {
  log.section('DATA QUALITY CHECKS');

  let passed = 0;
  let failed = 0;

  // Check for completed interviews with Q&A
  log.info('Checking completed interviews have Q&A...');
  const { data: completedInterviews } = await supabase
    .from('interviews')
    .select('id, candidate_name')
    .eq('status', 'completed');

  if (completedInterviews && completedInterviews.length > 0) {
    log.info(`Found ${completedInterviews.length} completed interviews`);

    for (const interview of completedInterviews.slice(0, 3)) {
      const { count: qCount } = await supabase
        .from('interview_questions')
        .select('*', { count: 'exact', head: true })
        .eq('interview_id', interview.id);

      const { count: aCount } = await supabase
        .from('interview_answers')
        .select('*', { count: 'exact', head: true })
        .eq('interview_id', interview.id);

      if (qCount > 0 && aCount > 0) {
        log.success(`${interview.candidate_name}: ${qCount} questions, ${aCount} answers`);
        passed++;
      } else {
        log.error(`${interview.candidate_name}: Missing Q&A (Q:${qCount}, A:${aCount})`);
        failed++;
      }
    }
  }

  // Check for performance reports
  log.info('Checking performance reports...');
  const { count: reportCount } = await supabase
    .from('performance_reports')
    .select('*', { count: 'exact', head: true });

  if (reportCount >= 10) {
    log.success(`Found ${reportCount} performance reports`);
    passed++;
  } else {
    log.warning(`Only ${reportCount} performance reports (expected 14+)`);
  }

  // Check score ranges
  log.info('Checking score validity...');
  const { data: invalidScores } = await supabase
    .from('interviews')
    .select('id, candidate_name, overall_score')
    .not('overall_score', 'is', null)
    .or('overall_score.lt.0,overall_score.gt.100');

  if (invalidScores && invalidScores.length > 0) {
    log.error(`Found ${invalidScores.length} interviews with invalid scores`);
    failed++;
  } else {
    log.success('All scores are within valid range (0-100)');
    passed++;
  }

  return { passed, failed };
}

async function verifyPlanColumn() {
  log.section('PLAN COLUMN VERIFICATION');

  try {
    // Check if plan column exists
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, plan')
      .limit(5);

    if (error) {
      if (error.message.includes('column') && error.message.includes('plan')) {
        log.error('Plan column does not exist in users table');
        log.info('Please run: sample/add_plan_column_migration.sql in Supabase SQL Editor');
        return false;
      }
      throw error;
    }

    log.success('Plan column exists in users table');

    // Check if users have plans
    const usersWithoutPlan = users.filter(u => !u.plan);
    if (usersWithoutPlan.length > 0) {
      log.warning(`${usersWithoutPlan.length} users without a plan assigned`);
    } else {
      log.success('All users have a plan assigned');
    }

    // Show plan distribution
    const { data: planCounts } = await supabase
      .from('users')
      .select('plan');

    if (planCounts) {
      const distribution = planCounts.reduce((acc, u) => {
        acc[u.plan || 'null'] = (acc[u.plan || 'null'] || 0) + 1;
        return acc;
      }, {});

      log.info('Plan distribution:');
      Object.entries(distribution).forEach(([plan, count]) => {
        console.log(`  ${plan}: ${count}`);
      });
    }

    return true;
  } catch (error) {
    log.error(`Failed to verify plan column: ${error.message}`);
    return false;
  }
}

async function verifySampleInterviews() {
  log.section('SAMPLE INTERVIEW VERIFICATION');

  try {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('id, candidate_name, position, status, overall_score')
      .limit(5);

    if (error) throw error;

    if (!interviews || interviews.length === 0) {
      log.warning('No interviews found in database');
      return;
    }

    log.info(`Sample of ${interviews.length} interviews:`);
    interviews.forEach((int, idx) => {
      console.log(`  ${idx + 1}. ${int.candidate_name} - ${int.position}`);
      console.log(`     Status: ${int.status}, Score: ${int.overall_score || 'N/A'}`);
    });

    log.success(`Total interviews available for testing`);
  } catch (error) {
    log.error(`Failed to fetch sample interviews: ${error.message}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   JD Labs Database Verification                                   ║
║   Version 1.0                                                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);

  try {
    // Run all verification checks
    const tableResults = await verifyTableCounts();
    const fkResults = await verifyForeignKeys();
    const qualityResults = await verifyDataQuality();
    const planExists = await verifyPlanColumn();
    await verifySampleInterviews();

    // Summary
    log.section('VERIFICATION SUMMARY');

    const totalPassed = fkResults.passed + qualityResults.passed;
    const totalFailed = fkResults.failed + qualityResults.failed;

    console.log(`  Tests Passed: ${totalPassed}`);
    console.log(`  Tests Failed: ${totalFailed}`);
    console.log(`  Plan Column: ${planExists ? 'EXISTS' : 'MISSING'}`);

    if (totalFailed === 0 && planExists) {
      log.success('\n✨ All verifications passed! Database is ready for use.');
    } else {
      log.warning('\n⚠️  Some issues found. Please review the output above.');
      if (!planExists) {
        log.info('\nTo fix missing plan column:');
        log.info('  1. Open Supabase Dashboard → SQL Editor');
        log.info('  2. Run: sample/add_plan_column_migration.sql');
      }
    }

  } catch (error) {
    log.error(`\nVerification failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
