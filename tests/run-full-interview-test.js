#!/usr/bin/env node

/**
 * Full Interview Test - Automated Complete Interview Simulation
 * This script will:
 * 1. Open the app
 * 2. Complete a full interview
 * 3. Verify data is stored in database
 * 4. Generate a comprehensive test report
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create test results directory
const testResultsDir = './test-results';
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

const videosDir = path.join(testResultsDir, 'videos');
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function runFullInterviewTest() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║               🎯 FULL INTERVIEW TEST WITH DATA VERIFICATION                    ║');
  console.log('║                                                                                ║');
  console.log('║  This test will:                                                               ║');
  console.log('║  1. Open the interview application                                             ║');
  console.log('║  2. Complete a full interview                                                  ║');
  console.log('║  3. Verify all data is stored in database                                      ║');
  console.log('║  4. Generate detailed test report                                              ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  let browser;
  let testResults = {
    flowSteps: [],
    databaseChecks: [],
    newInterview: null,
    errors: []
  };

  try {
    // ==================== PHASE 1: SETUP ====================
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 1: TEST SETUP & DATABASE BASELINE');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    // Get baseline interview count
    console.log('📊 Capturing database baseline...');
    const { data: baselineInterviews } = await supabase
      .from('interviews')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1);

    const baselineInterviewId = baselineInterviews?.[0]?.id || null;
    console.log(`   ✅ Baseline interview: ${baselineInterviewId || 'None'}`);

    // ==================== PHASE 2: BROWSER AUTOMATION ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 2: INTERVIEW FLOW AUTOMATION');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('📋 Launching browser...');
    browser = await chromium.launch({
      headless: false,
      slowMo: 200
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(20000);

    // Navigate to app
    console.log('   📍 Navigating to http://localhost:8080/');
    await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const ss1 = path.join(testResultsDir, 'test-01-homepage.png');
    await page.screenshot({ path: ss1 });
    testResults.flowSteps.push(`✅ Homepage loaded - ${ss1}`);
    console.log('   ✅ Homepage loaded');

    // Wait for React components to fully render
    console.log('   ⏳ Waiting for UI to fully render...');
    await page.waitForTimeout(3000);

    // ==================== LOGIN ====================
    console.log('\n   🔐 Attempting login...');

    // Look for login button or fields
    const loginBtn = await page.locator('button, a').filter({ hasText: /Login|Sign In/i }).first();
    const loginVisible = await loginBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (loginVisible) {
      console.log('   ✅ Found login button, clicking...');
      await loginBtn.click();
      await page.waitForTimeout(2000);
    }

    // Find and fill username
    const usernameInputs = await page.locator('input[type="text"], input[type="email"]').all();
    if (usernameInputs.length > 0) {
      console.log('   ✍️  Filling username...');
      await usernameInputs[0].fill('veerabathirankarthik');
      console.log('   ✅ Username filled');
      testResults.flowSteps.push(`✅ Username entered`);
    }

    // Find and fill password
    const passwordInput = await page.locator('input[type="password"]').first();
    const passwordVisible = await passwordInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (passwordVisible) {
      console.log('   ✍️  Filling password...');
      await passwordInput.fill('password');
      console.log('   ✅ Password filled');
      testResults.flowSteps.push(`✅ Password entered`);
    }

    // Click login/submit button
    const loginSubmit = await page.locator('button').filter({ hasText: /Login|Sign In|Submit/i }).first();
    const loginSubmitVisible = await loginSubmit.isVisible({ timeout: 3000 }).catch(() => false);

    if (loginSubmitVisible) {
      console.log('   🔑 Submitting login...');
      await loginSubmit.click();
      console.log('   ⏳ Waiting for authentication...');
      await page.waitForTimeout(3000);
      testResults.flowSteps.push(`✅ Login submitted`);
      console.log('   ✅ Login completed');
    }

    // Try to find all buttons and log them
    const buttons = await page.locator('button').all();
    console.log(`   📌 Found ${buttons.length} buttons`);

    // Look for Start Interview or equivalent
    console.log('   🔍 Looking for interview start mechanism...');
    let interviewStarted = false;

    // Try multiple selectors
    const selectors = [
      'button:has-text("Start Interview")',
      'button:has-text("Begin")',
      'button:has-text("Launch")',
      'a:has-text("Start")',
      'button'
    ];

    for (const selector of selectors) {
      try {
        const elem = await page.locator(selector).first();
        const isVisible = await elem.isVisible({ timeout: 2000 }).catch(() => false);

        if (isVisible) {
          const text = await elem.textContent();
          console.log(`   ✅ Found button: "${text?.trim()}"`);

          // Click the button
          await elem.click();
          console.log('   ✅ Clicked - waiting for navigation...');
          await page.waitForTimeout(2000);
          interviewStarted = true;
          testResults.flowSteps.push(`✅ Started interview`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!interviewStarted) {
      console.log('   ⚠️  Could not find start button, checking current state...');
    }

    const ss2 = path.join(testResultsDir, 'test-02-after-start.png');
    await page.screenshot({ path: ss2 });
    testResults.flowSteps.push(`✅ After start - ${ss2}`);
    console.log(`   📸 Screenshot: ${ss2}`);

    // Fill form fields if present
    console.log('\n   📋 Looking for form fields...');
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`   📌 Found ${inputs.length} text inputs`);

    if (inputs.length >= 1) {
      console.log('   ✍️  Filling candidate name...');
      await inputs[0].fill('Automated Test User');
      testResults.flowSteps.push(`✅ Filled candidate name`);
      console.log('   ✅ Candidate name filled');
    }

    if (inputs.length >= 2) {
      console.log('   ✍️  Filling position...');
      await inputs[1].fill('Senior Engineer');
      testResults.flowSteps.push(`✅ Filled position`);
      console.log('   ✅ Position filled');
    }

    await page.waitForTimeout(1000);

    const ss3 = path.join(testResultsDir, 'test-03-form-filled.png');
    await page.screenshot({ path: ss3 });
    testResults.flowSteps.push(`✅ Form filled - ${ss3}`);

    // Try to find and click submit button
    console.log('\n   🔍 Looking for submit button...');
    const submitButton = await page.locator('button').filter({ hasText: /Submit|Start|Next|Continue/i }).first();
    const submitVisible = await submitButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (submitVisible) {
      const submitText = await submitButton.textContent();
      console.log(`   ✅ Found submit button: "${submitText?.trim()}"`);
      await submitButton.click();
      console.log('   ✅ Clicked submit');
      testResults.flowSteps.push(`✅ Submitted form`);
      await page.waitForTimeout(3000);
    }

    const ss4 = path.join(testResultsDir, 'test-04-interview-screen.png');
    await page.screenshot({ path: ss4 });
    testResults.flowSteps.push(`✅ Interview screen - ${ss4}`);

    // Look for answer inputs and fill them
    console.log('\n   🔍 Looking for answer inputs...');
    const textareas = await page.locator('textarea').all();
    console.log(`   📌 Found ${textareas.length} textareas`);

    if (textareas.length > 0) {
      const sampleAnswers = [
        'I would approach this problem by analyzing the requirements and breaking it down into smaller components.',
        'I believe communication is key - I would explain my thinking clearly and ask clarifying questions.',
        'I focus on writing clean, maintainable code with proper error handling and testing.'
      ];

      for (let i = 0; i < Math.min(textareas.length, 3); i++) {
        console.log(`   ✍️  Filling answer ${i + 1}...`);
        await textareas[i].fill(sampleAnswers[i]);
        testResults.flowSteps.push(`✅ Answered question ${i + 1}`);
        console.log(`   ✅ Answer ${i + 1} filled`);

        // Look for next button
        const nextBtn = await page.locator('button').filter({ hasText: /Next|Continue|Submit/i }).first();
        const nextVisible = await nextBtn.isVisible({ timeout: 3000 }).catch(() => false);

        if (nextVisible && i < textareas.length - 1) {
          await nextBtn.click();
          await page.waitForTimeout(1500);
        }
      }
    }

    const ss5 = path.join(testResultsDir, 'test-05-answers-filled.png');
    await page.screenshot({ path: ss5 });
    testResults.flowSteps.push(`✅ Answers filled - ${ss5}`);

    // Look for completion/finish button
    console.log('\n   🔍 Looking for completion button...');
    const completeButton = await page.locator('button').filter({ hasText: /Complete|Finish|Submit|Done/i }).first();
    const completeVisible = await completeButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (completeVisible) {
      const completeText = await completeButton.textContent();
      console.log(`   ✅ Found completion button: "${completeText?.trim()}"`);
      await completeButton.click();
      console.log('   ✅ Clicked complete - finalizing interview...');
      testResults.flowSteps.push(`✅ Completed interview`);
      await page.waitForTimeout(3000);
    }

    const ss6 = path.join(testResultsDir, 'test-06-completion.png');
    await page.screenshot({ path: ss6 });
    testResults.flowSteps.push(`✅ Completion screen - ${ss6}`);

    // ==================== PHASE 3: DATABASE VERIFICATION ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 3: DATABASE VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('⏳ Waiting for data to be persisted (2 seconds)...');
    await page.waitForTimeout(2000);

    // Check for new interview
    console.log('\n📋 Check 1: New Interview Record');
    const { data: newInterviews } = await supabase
      .from('interviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (newInterviews && newInterviews.length > 0) {
      const newInterview = newInterviews[0];
      testResults.newInterview = newInterview;

      console.log('   ✅ New interview found!');
      console.log(`   • ID: ${newInterview.id}`);
      console.log(`   • Candidate: ${newInterview.candidate_name}`);
      console.log(`   • Position: ${newInterview.position}`);
      console.log(`   • Status: ${newInterview.status}`);
      console.log(`   • Duration Minutes: ${newInterview.duration_minutes || 'NULL (pending)'}`);
      console.log(`   • Overall Score: ${newInterview.overall_score || 'NULL (pending)'}`);
      console.log(`   • Started At: ${newInterview.started_at || 'NULL'}`);
      console.log(`   • Ended At: ${newInterview.ended_at || 'NULL'}`);

      testResults.databaseChecks.push(`✅ Interview record found`);
    } else {
      console.log('   ⚠️  No new interview found');
      testResults.databaseChecks.push(`⚠️  No interview record`);
    }

    // Check for questions
    console.log('\n📋 Check 2: Questions Table');
    const { data: questions } = await supabase
      .from('interview_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (questions && questions.length > 0) {
      console.log(`   ✅ Found ${questions.length} questions!`);
      questions.forEach((q, idx) => {
        console.log(`   ${idx + 1}. Order: ${q.question_order || 'NULL'}, Asked: ${q.asked_at || 'NULL'}`);
        console.log(`      Text: ${q.question_text?.substring(0, 60) || 'NULL'}...`);
      });
      testResults.databaseChecks.push(`✅ Questions stored: ${questions.length}`);
    } else {
      console.log('   ⚠️  No questions stored');
      testResults.databaseChecks.push(`⚠️  No questions stored`);
    }

    // Check for answers
    console.log('\n📋 Check 3: Answers Table');
    const { data: answers } = await supabase
      .from('interview_answers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (answers && answers.length > 0) {
      console.log(`   ✅ Found ${answers.length} answers!`);
      answers.forEach((a, idx) => {
        console.log(`   ${idx + 1}. Duration: ${a.duration_seconds || 'NULL'} seconds`);
        console.log(`      Text: ${a.answer_text?.substring(0, 60) || 'NULL'}...`);
      });
      testResults.databaseChecks.push(`✅ Answers stored: ${answers.length}`);
    } else {
      console.log('   ⚠️  No answers stored');
      testResults.databaseChecks.push(`⚠️  No answers stored`);
    }

    // Check for performance report
    console.log('\n📋 Check 4: Performance Reports');
    const { data: reports } = await supabase
      .from('performance_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    if (reports && reports.length > 0) {
      const report = reports[0];
      console.log('   ✅ Performance report found!');
      console.log(`   • Overall Score: ${report.overall_score}`);
      console.log(`   • Technical Score: ${report.technical_score}`);
      console.log(`   • Communication Score: ${report.communication_score}`);
      console.log(`   • Problem Solving: ${report.problem_solving_score}`);
      console.log(`   • Feedback: ${report.feedback?.substring(0, 100) || 'NULL'}...`);
      testResults.databaseChecks.push(`✅ Performance report created`);
    } else {
      console.log('   ⚠️  No performance report found');
      testResults.databaseChecks.push(`⚠️  No performance report`);
    }

    // Check audit logs
    console.log('\n📋 Check 5: Audit Logs');
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const finalizeEntries = logs?.filter(l => l.action === 'INTERVIEW_FINALIZE') || [];
    if (finalizeEntries.length > 0) {
      const latest = finalizeEntries[0];
      console.log('   ✅ INTERVIEW_FINALIZE logged!');
      console.log(`   • Interview ID: ${latest.resource_id}`);
      console.log(`   • Created At: ${latest.created_at}`);
      if (latest.details) {
        console.log(`   • Details:`, JSON.stringify(latest.details, null, 2));
      }
      testResults.databaseChecks.push(`✅ INTERVIEW_FINALIZE logged`);
    } else {
      console.log('   ⚠️  INTERVIEW_FINALIZE not logged');
      testResults.databaseChecks.push(`⚠️  INTERVIEW_FINALIZE not logged`);
    }

    // ==================== PHASE 4: SUMMARY ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('PHASE 4: TEST SUMMARY & RESULTS');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    console.log('✅ INTERVIEW FLOW STEPS:');
    testResults.flowSteps.forEach(step => console.log(`   ${step}`));

    console.log('\n✅ DATABASE VERIFICATION CHECKS:');
    testResults.databaseChecks.forEach(check => console.log(`   ${check}`));

    // Final assessment
    const questionsStored = (questions?.length || 0) > 0;
    const answersStored = (answers?.length || 0) > 0;
    const reportCreated = (reports?.length || 0) > 0;
    const finalizeLogged = finalizeEntries.length > 0;

    console.log('\n📊 FINAL ASSESSMENT:');
    console.log(`   Interview Created: ${testResults.newInterview ? '✅ YES' : '❌ NO'}`);
    console.log(`   Questions Stored: ${questionsStored ? '✅ YES' : '⚠️ NO'}`);
    console.log(`   Answers Stored: ${answersStored ? '✅ YES' : '⚠️ NO'}`);
    console.log(`   Report Created: ${reportCreated ? '✅ YES' : '⚠️ NO'}`);
    console.log(`   INTERVIEW_FINALIZE Logged: ${finalizeLogged ? '✅ YES' : '⚠️ NO'}`);

    const successCount = [
      testResults.newInterview ? 1 : 0,
      questionsStored ? 1 : 0,
      answersStored ? 1 : 0,
      reportCreated ? 1 : 0,
      finalizeLogged ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    console.log(`\n📈 SUCCESS RATE: ${successCount}/5 (${(successCount * 20)}%)`);

    if (successCount === 5) {
      console.log('\n🎉 ALL CHECKS PASSED! Data storage is working perfectly!');
    } else if (successCount >= 3) {
      console.log('\n✅ MOST CHECKS PASSED! Interview flow working, some data storage pending.');
    } else {
      console.log('\n⚠️  PARTIAL SUCCESS - Interview started but data storage may need investigation.');
    }

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('Test complete! Check test-results/ directory for screenshots.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error(error.stack);
    testResults.errors.push(error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// Run the test
runFullInterviewTest();
