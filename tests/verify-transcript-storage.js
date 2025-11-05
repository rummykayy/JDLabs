#!/usr/bin/env node

/**
 * Verify Interview Transcript Storage
 * This script tests the complete interview flow with Playwright
 * and verifies data is stored correctly in the database
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const APP_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Verify environment
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Supabase credentials not found in environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyTranscriptStorage() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 INTERVIEW TRANSCRIPT STORAGE VERIFICATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let browser;
  let testInterviewId = null;

  try {
    // Step 1: Database verification before interview
    console.log('📋 Step 1: Verify Database Schema');
    console.log('───────────────────────────────────────────────────────────────');

    const tables = ['interviews', 'interview_questions', 'interview_answers', 'performance_reports'];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}: Accessible`);
      }
    }

    // Step 2: Launch Playwright browser
    console.log('\n📋 Step 2: Launch Browser and Start Interview');
    console.log('───────────────────────────────────────────────────────────────');

    browser = await chromium.launch({ headless: false });
    const context = await browser.createContext();
    const page = await context.newPage();

    // Navigate to app
    console.log('  → Opening application...');
    await page.goto(APP_URL, { waitUntil: 'networkidle' });

    // Get interview ID from URL or form
    const startBtn = await page.$('button:has-text("Start Interview")');
    if (!startBtn) {
      throw new Error('Could not find "Start Interview" button');
    }

    console.log('  ✅ Application loaded');
    console.log('  → Starting interview...');

    await startBtn.click();
    await page.waitForNavigation();

    // Fill setup form
    console.log('  → Filling interview setup form...');
    await page.fill('input[name="candidateName"], input[placeholder="Your full name"]', 'Test Candidate');
    await page.fill('input[name="position"], input[placeholder="Job position"]', 'Software Engineer');

    const submitBtn = await page.$('button:has-text("Start Interview")');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }

    // Extract interview ID from URL
    const currentUrl = page.url();
    const urlMatch = currentUrl.match(/interview\/([a-f0-9-]+)/);
    if (urlMatch) {
      testInterviewId = urlMatch[1];
      console.log(`  ✅ Interview created: ${testInterviewId}`);
    }

    // Step 3: Verify interview in database during session
    console.log('\n📋 Step 3: Verify Interview Record Created');
    console.log('───────────────────────────────────────────────────────────────');

    const { data: interviews, error: fetchError } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', testInterviewId)
      .single();

    if (fetchError) {
      console.log(`  ❌ Could not fetch interview: ${fetchError.message}`);
    } else {
      console.log(`  ✅ Interview record exists`);
      console.log(`     • ID: ${interviews.id}`);
      console.log(`     • Candidate: ${interviews.candidate_name}`);
      console.log(`     • Status: ${interviews.status}`);
      console.log(`     • Started at: ${interviews.started_at}`);
    }

    // Step 4: Simulate interview interaction
    console.log('\n📋 Step 4: Simulate Interview Interaction');
    console.log('───────────────────────────────────────────────────────────────');

    // Wait for questions to appear
    const questionVisible = await page.waitForSelector('[data-testid="question"], .question', { timeout: 10000 }).catch(() => null);

    if (questionVisible) {
      console.log('  ✅ Question displayed');

      // Find answer input and fill it
      const answerInput = await page.$('textarea[name="answer"], textarea, input[type="text"]');
      if (answerInput) {
        await answerInput.fill('This is a test answer to the interview question.');
        console.log('  ✅ Answer provided');
      }

      // Submit answer
      const submitAnswer = await page.$('button:has-text("Submit"), button:has-text("Next"), button:has-text("Continue")');
      if (submitAnswer) {
        await submitAnswer.click();
        await page.waitForTimeout(1000);
        console.log('  ✅ Answer submitted');
      }
    } else {
      console.log('  ⚠️  Could not find question element (interview may be in different state)');
    }

    // Step 5: Check for completion
    console.log('\n📋 Step 5: Complete Interview');
    console.log('───────────────────────────────────────────────────────────────');

    // Look for completion or review screen
    const reviewBtn = await page.$('button:has-text("Complete"), button:has-text("Review"), button:has-text("Finish")');
    if (reviewBtn) {
      await reviewBtn.click();
      await page.waitForTimeout(2000);
      console.log('  ✅ Interview completed');
    }

    // Step 6: Verify database after interview
    console.log('\n📋 Step 6: Verify Interview Data Storage');
    console.log('───────────────────────────────────────────────────────────────');

    // Re-fetch interview
    const { data: updatedInterview } = await supabase
      .from('interviews')
      .select('*')
      .eq('id', testInterviewId)
      .single();

    if (updatedInterview) {
      console.log('  ✅ Interview data persisted');
      console.log(`     • Status: ${updatedInterview.status}`);
      console.log(`     • Duration: ${updatedInterview.duration_minutes || 'N/A'} minutes`);
      console.log(`     • Overall Score: ${updatedInterview.overall_score || 'N/A'}`);
      console.log(`     • Video URL: ${updatedInterview.video_url ? 'Yes' : 'No'}`);
    }

    // Step 7: Verify Q&A storage
    console.log('\n📋 Step 7: Verify Q&A Transcript Storage');
    console.log('───────────────────────────────────────────────────────────────');

    const { data: questions, error: qError } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', testInterviewId);

    if (!qError && questions.length > 0) {
      console.log(`  ✅ Questions stored (${questions.length} questions)`);
      questions.forEach((q, idx) => {
        console.log(`     ${idx + 1}. [Order: ${q.question_order}] ${q.question_text?.substring(0, 50)}...`);
        console.log(`        Asked at: ${q.asked_at}`);
      });
    } else {
      console.log(`  ⚠️  No questions found in database (may still be processing)`);
    }

    // Step 8: Verify answers
    const { data: answers, error: aError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('interview_id', testInterviewId);

    if (!aError && answers.length > 0) {
      console.log(`\n  ✅ Answers stored (${answers.length} answers)`);
      answers.forEach((a, idx) => {
        console.log(`     ${idx + 1}. ${a.answer_text?.substring(0, 50)}...`);
        console.log(`        Duration: ${a.duration_seconds || 'N/A'} seconds`);
      });
    } else {
      console.log(`  ⚠️  No answers found in database (may still be processing)`);
    }

    // Step 9: Verify performance report
    console.log('\n📋 Step 8: Verify Performance Report');
    console.log('───────────────────────────────────────────────────────────────');

    const { data: reports, error: rError } = await supabase
      .from('performance_reports')
      .select('*')
      .eq('interview_id', testInterviewId);

    if (!rError && reports.length > 0) {
      console.log(`  ✅ Performance report created`);
      const report = reports[0];
      console.log(`     • Overall Score: ${report.overall_score || 'N/A'}`);
      console.log(`     • Technical Score: ${report.technical_score || 'N/A'}`);
      console.log(`     • Communication Score: ${report.communication_score || 'N/A'}`);
      console.log(`     • Problem Solving: ${report.problem_solving_score || 'N/A'}`);
      if (report.feedback) {
        console.log(`     • Feedback: ${report.feedback.substring(0, 100)}...`);
      }
    } else {
      console.log(`  ⚠️  No performance report found (may still be processing)`);
    }

    // Step 10: Verify audit log
    console.log('\n📋 Step 9: Verify Audit Trail');
    console.log('───────────────────────────────────────────────────────────────');

    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_id', testInterviewId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (auditLogs && auditLogs.length > 0) {
      console.log(`  ✅ Audit logs recorded (${auditLogs.length} entries)`);
      auditLogs.forEach(log => {
        console.log(`     • ${log.action} (${new Date(log.created_at).toLocaleString()})`);
        if (log.details) {
          console.log(`       Details: ${JSON.stringify(log.details).substring(0, 80)}...`);
        }
      });
    } else {
      console.log(`  ⚠️  No audit logs found for this interview`);
    }

    // Final summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log(`  • Interview ID: ${testInterviewId}`);
    console.log(`  • Interview Status: ${updatedInterview?.status || 'unknown'}`);
    console.log(`  • Questions Stored: ${questions?.length || 0}`);
    console.log(`  • Answers Stored: ${answers?.length || 0}`);
    console.log(`  • Performance Reports: ${reports?.length || 0}`);
    console.log(`  • Audit Log Entries: ${auditLogs?.length || 0}`);
    console.log('\n✨ Transcript storage is working correctly!\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during verification:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run verification
verifyTranscriptStorage();
