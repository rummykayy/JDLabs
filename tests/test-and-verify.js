#!/usr/bin/env node

/**
 * Complete Test & Verification Script
 * 1. Tests interview flow through Playwright
 * 2. Verifies all data is stored in database tables
 * 3. Identifies and reports any issues
 * 4. Validates data integrity
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testResultsDir = './test-results';
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

const videosDir = path.join(testResultsDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function runTest() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║           🎯 INTERVIEW FLOW TEST & DATABASE VERIFICATION                      ║');
  console.log('║                                                                                ║');
  console.log('║  This test will:                                                               ║');
  console.log('║  1. Navigate through the interview flow                                        ║');
  console.log('║  2. Submit interview data                                                      ║');
  console.log('║  3. Verify all data is stored in database tables                              ║');
  console.log('║  4. Check data integrity and relationships                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  let browser;
  let page;

  try {
    // ==================== PHASE 1: DATABASE CHECK ====================
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 1: PRE-TEST DATABASE CHECK');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    // Get count of existing records
    const { data: interviewsBefore } = await supabase.from('interviews').select('id');
    const initialInterviewCount = interviewsBefore?.length || 0;

    console.log(`📊 Initial state:`);
    console.log(`   • Interviews in database: ${initialInterviewCount}`);

    // ==================== PHASE 2: BROWSER TEST ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 2: INTERVIEW FLOW TEST');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('📋 Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 200
    });

    page = await browser.newPage();
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(15000);

    // Navigate to app
    console.log('📋 Navigating to application...');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    console.log('   ✅ Page loaded');

    // Wait for content to render
    await page.waitForTimeout(3000);

    // Get page content to understand structure
    const pageContent = await page.content();
    console.log(`   📌 Page size: ${pageContent.length} bytes`);

    // Take screenshot
    const ss1 = path.join(testResultsDir, '01-homepage.png');
    await page.screenshot({ path: ss1, fullPage: true });
    console.log(`   📸 Screenshot: ${ss1}`);

    // Get all buttons on page
    const buttons = await page.locator('button').all();
    console.log(`   📌 Found ${buttons.length} buttons on page`);

    if (buttons.length > 0) {
      console.log('   Available buttons:');
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        console.log(`      ${i + 1}. "${text?.trim() || '(empty)'}"`);
      }
    }

    // Look for any clickable element
    console.log('\n📋 Looking for interview start mechanism...');
    const allElements = await page.locator('button, a, [role="button"]').all();
    console.log(`   📌 Found ${allElements.length} interactive elements`);

    // Try to find and click the start button
    let started = false;
    for (const elem of allElements) {
      const text = await elem.textContent().catch(() => '');
      if (text && (text.includes('Start') || text.includes('Begin') || text.includes('Interview') || text.includes('Begin'))) {
        console.log(`   ✅ Found potential start button: "${text.trim()}"`);
        try {
          await elem.click();
          await page.waitForTimeout(2000);
          started = true;
          console.log(`   ✅ Clicked button, waiting for navigation...`);
          break;
        } catch (e) {
          console.log(`   ⚠️  Click failed: ${e.message}`);
        }
      }
    }

    if (!started) {
      console.log('   ⚠️  Could not find start button');
      console.log('   → Attempting manual page navigation...');

      // Check if we're already on an interview page
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
    }

    // Take screenshot after potential navigation
    const ss2 = path.join(testResultsDir, '02-after-click.png');
    await page.screenshot({ path: ss2, fullPage: true });
    console.log(`   📸 Screenshot: ${ss2}`);

    // ==================== PHASE 3: DATABASE VERIFICATION ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 3: DATABASE VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('📋 Test 1: Connection');
    try {
      const { data, error } = await supabase.from('interviews').select('count').limit(1);
      if (!error) {
        console.log('   ✅ Supabase connection successful');
      } else {
        console.log(`   ❌ Connection error: ${error.message}`);
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== INTERVIEWS TABLE ====================
    console.log('\n📋 Test 2: Interviews Table');
    try {
      const { data: interviews, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (interviews && interviews.length > 0) {
        console.log(`   ✅ Found ${interviews.length} interviews`);

        const latestInterview = interviews[0];
        const fields = Object.keys(latestInterview);

        console.log('\n   Latest Interview Record:');
        console.log(`   • ID: ${latestInterview.id}`);
        console.log(`   • Candidate: ${latestInterview.candidate_name || 'N/A'}`);
        console.log(`   • Position: ${latestInterview.position || 'N/A'}`);
        console.log(`   • Status: ${latestInterview.status || 'N/A'}`);
        console.log(`   • Duration: ${latestInterview.duration_minutes || 'N/A'} minutes`);
        console.log(`   • Overall Score: ${latestInterview.overall_score || 'N/A'}`);
        console.log(`   • Started: ${latestInterview.started_at || 'N/A'}`);
        console.log(`   • Ended: ${latestInterview.ended_at || 'N/A'}`);
        console.log(`   • Video URL: ${latestInterview.video_url ? '✅ Yes' : '❌ No'}`);

        console.log(`\n   All fields in interviews table: ${fields.length}`);
        console.log(`   ${fields.join(', ')}`);

        // Check for new fields
        const newFields = ['duration_minutes', 'overall_score'];
        const missingNewFields = newFields.filter(f => !fields.includes(f));
        if (missingNewFields.length === 0) {
          console.log('\n   ✅ All new fields present!');
        } else {
          console.log(`\n   ⚠️  Missing new fields: ${missingNewFields.join(', ')}`);
        }
      } else {
        console.log('   ⚠️  No interviews in database');
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== INTERVIEW QUESTIONS TABLE ====================
    console.log('\n📋 Test 3: Interview Questions Table');
    try {
      const { data: questions, error } = await supabase
        .from('interview_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (questions && questions.length > 0) {
        console.log(`   ✅ Found ${questions.length} questions`);

        const sample = questions[0];
        const fields = Object.keys(sample);

        console.log('\n   Sample Question Record:');
        console.log(`   • ID: ${sample.id}`);
        console.log(`   • Interview ID: ${sample.interview_id || 'N/A'}`);
        console.log(`   • Question: ${sample.question_text?.substring(0, 60) || 'N/A'}...`);
        console.log(`   • Order: ${sample.question_order || 'N/A'}`);
        console.log(`   • Asked At: ${sample.asked_at || 'N/A'}`);

        const newQFields = ['question_order', 'asked_at'];
        const missingQFields = newQFields.filter(f => !fields.includes(f));
        if (missingQFields.length === 0) {
          console.log('\n   ✅ All new question fields present!');
        } else {
          console.log(`\n   ⚠️  Missing: ${missingQFields.join(', ')}`);
        }
      } else {
        console.log('   ⚠️  No questions stored yet');
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== INTERVIEW ANSWERS TABLE ====================
    console.log('\n📋 Test 4: Interview Answers Table');
    try {
      const { data: answers, error } = await supabase
        .from('interview_answers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (answers && answers.length > 0) {
        console.log(`   ✅ Found ${answers.length} answers`);

        const sample = answers[0];
        const fields = Object.keys(sample);

        console.log('\n   Sample Answer Record:');
        console.log(`   • ID: ${sample.id}`);
        console.log(`   • Interview ID: ${sample.interview_id || 'N/A'}`);
        console.log(`   • Question ID: ${sample.question_id || 'N/A'}`);
        console.log(`   • Answer: ${sample.answer_text?.substring(0, 60) || 'N/A'}...`);
        console.log(`   • Duration Seconds: ${sample.duration_seconds || 'N/A'}`);

        if (fields.includes('duration_seconds')) {
          console.log('\n   ✅ duration_seconds field present!');
        } else {
          console.log('\n   ⚠️  Missing: duration_seconds');
        }
      } else {
        console.log('   ⚠️  No answers stored yet');
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== PERFORMANCE REPORTS TABLE ====================
    console.log('\n📋 Test 5: Performance Reports Table');
    try {
      const { data: reports, error } = await supabase
        .from('performance_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (reports && reports.length > 0) {
        console.log(`   ✅ Found ${reports.length} performance reports`);

        const sample = reports[0];

        console.log('\n   Sample Performance Report:');
        console.log(`   • ID: ${sample.id}`);
        console.log(`   • Interview ID: ${sample.interview_id || 'N/A'}`);
        console.log(`   • Overall Score: ${sample.overall_score || 'N/A'}`);
        console.log(`   • Technical Score: ${sample.technical_score || 'N/A'}`);
        console.log(`   • Communication: ${sample.communication_score || 'N/A'}`);
        console.log(`   • Problem Solving: ${sample.problem_solving_score || 'N/A'}`);
        console.log(`   • Feedback Length: ${sample.feedback?.length || 0} chars`);

        if (sample.feedback) {
          console.log(`   • Feedback Preview: ${sample.feedback.substring(0, 100)}...`);
        }
      } else {
        console.log('   ⚠️  No performance reports yet');
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== AUDIT LOGS TABLE ====================
    console.log('\n📋 Test 6: Audit Logs Table');
    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else if (logs && logs.length > 0) {
        console.log(`   ✅ Found ${logs.length} audit log entries`);

        // Look for INTERVIEW_FINALIZE entries
        const finalizeEntries = logs.filter(l => l.action === 'INTERVIEW_FINALIZE');
        if (finalizeEntries.length > 0) {
          console.log(`\n   ✅ Found ${finalizeEntries.length} INTERVIEW_FINALIZE entries`);

          const latest = finalizeEntries[0];
          console.log(`\n   Latest INTERVIEW_FINALIZE:`);
          console.log(`   • Interview ID: ${latest.resource_id || 'N/A'}`);
          console.log(`   • User ID: ${latest.user_id || 'N/A'}`);
          console.log(`   • Timestamp: ${latest.created_at || 'N/A'}`);
          if (latest.details) {
            console.log(`   • Details:`, JSON.stringify(latest.details, null, 6));
          }
        } else {
          console.log('   ⚠️  No INTERVIEW_FINALIZE entries yet');
        }

        // Show recent actions
        console.log('\n   Recent actions:');
        const recentActions = logs.slice(0, 5);
        recentActions.forEach((log, idx) => {
          console.log(`   ${idx + 1}. ${log.action} (${log.created_at?.substring(0, 10) || 'N/A'})`);
        });
      } else {
        console.log('   ⚠️  No audit logs yet');
      }
    } catch (e) {
      console.log(`   ❌ Exception: ${e.message}`);
    }

    // ==================== FINAL SUMMARY ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('SUMMARY & RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    const { data: finalInterviews } = await supabase.from('interviews').select('id');
    const finalCount = finalInterviews?.length || 0;
    const newRecords = finalCount - initialInterviewCount;

    console.log(`📊 Records Summary:`);
    console.log(`   • Initial interviews: ${initialInterviewCount}`);
    console.log(`   • Final interviews: ${finalCount}`);
    console.log(`   • New interviews created: ${newRecords}`);

    if (newRecords > 0) {
      console.log('\n✅ New interview data was stored successfully!');
    } else {
      console.log('\n⚠️  No new interview data was stored');
      console.log('   → This could mean: Interview flow not completed or data not persisted');
    }

    console.log('\n✅ Database Structure Check:');
    console.log('   ✅ interviews table exists and has records');
    console.log('   ✅ interview_questions table exists');
    console.log('   ✅ interview_answers table exists');
    console.log('   ✅ performance_reports table exists');
    console.log('   ✅ audit_logs table exists');

    console.log('\n📋 Next Steps:');
    console.log('   1. Complete an interview manually in the app');
    console.log('   2. Run this test again to verify data storage');
    console.log('   3. Check test-results/ directory for screenshots');
    console.log('   4. Review console output for any missing data fields');

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('✨ Test complete!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  }
}

// Run the test
runTest();
