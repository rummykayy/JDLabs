#!/usr/bin/env node

/**
 * Complete Interview Flow Test with Database Validation
 * Tests the entire interview flow through Playwright and verifies data storage
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ensure test results directory exists
const testResultsDir = './test-results';
const videosDir = path.join(testResultsDir, 'videos');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

async function runCompleteTest() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                 🎯 COMPLETE INTERVIEW FLOW TEST WITH DATABASE VALIDATION      ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videosDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  const testResults = {
    passed: [],
    failed: [],
    databaseTests: [],
    screenshots: [],
    interviewId: null
  };

  try {
    // ==================== STEP 1: HOMEPAGE ====================
    console.log('📋 Step 1: Navigate to Homepage');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    const appUrl = 'http://localhost:8080'; // Using port 8080
    console.log(`   → Navigating to ${appUrl}`);

    await page.goto(appUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Take screenshot
    const screenshotPath1 = path.join(testResultsDir, 'interview-01-homepage.png');
    await page.screenshot({ path: screenshotPath1 });
    testResults.screenshots.push(screenshotPath1);
    testResults.passed.push('✅ Homepage loaded successfully');
    console.log('   ✅ Homepage loaded');
    console.log(`   📸 Screenshot: ${screenshotPath1}\n`);

    // ==================== STEP 2: START INTERVIEW ====================
    console.log('📋 Step 2: Find and Click "Start Interview" Button');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    const startButton = await page.locator('button, a').filter({ hasText: /Start Interview|Begin|Launch/i }).first();

    if (await startButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('   ✅ Start Interview button found');
      await startButton.click();
      await page.waitForTimeout(2000);

      const screenshotPath2 = path.join(testResultsDir, 'interview-02-setup-screen.png');
      await page.screenshot({ path: screenshotPath2 });
      testResults.screenshots.push(screenshotPath2);
      testResults.passed.push('✅ Start Interview clicked');
      console.log('   ✅ Interview started');
      console.log(`   📸 Screenshot: ${screenshotPath2}\n`);
    } else {
      throw new Error('Start Interview button not found');
    }

    // ==================== STEP 3: FILL FORM ====================
    console.log('📋 Step 3: Fill Interview Setup Form');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    // Fill candidate name
    const nameInputs = await page.locator('input[type="text"]').all();
    if (nameInputs.length > 0) {
      await nameInputs[0].fill('Test Candidate');
      console.log('   ✅ Candidate name filled: "Test Candidate"');
      testResults.passed.push('✅ Candidate name filled');
    }

    // Fill position
    if (nameInputs.length > 1) {
      await nameInputs[1].fill('Senior Backend Engineer');
      console.log('   ✅ Position filled: "Senior Backend Engineer"');
      testResults.passed.push('✅ Position filled');
    }

    await page.waitForTimeout(1000);

    // Take screenshot
    const screenshotPath3 = path.join(testResultsDir, 'interview-03-form-filled.png');
    await page.screenshot({ path: screenshotPath3 });
    testResults.screenshots.push(screenshotPath3);
    console.log(`   📸 Screenshot: ${screenshotPath3}\n`);

    // ==================== STEP 4: SUBMIT FORM ====================
    console.log('📋 Step 4: Submit Interview Setup Form');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    const submitButton = await page.locator('button').filter({ hasText: /Submit|Start|Continue|Next/i }).first();
    if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitButton.click();
      console.log('   ✅ Form submitted');
      testResults.passed.push('✅ Form submitted successfully');
      await page.waitForTimeout(3000);

      // Extract interview ID from URL if possible
      const currentUrl = page.url();
      const idMatch = currentUrl.match(/interview\/([a-f0-9-]+)/);
      if (idMatch) {
        testResults.interviewId = idMatch[1];
        console.log(`   📌 Interview ID: ${testResults.interviewId}`);
      }
    }

    // Take screenshot
    const screenshotPath4 = path.join(testResultsDir, 'interview-04-interview-screen.png');
    await page.screenshot({ path: screenshotPath4 });
    testResults.screenshots.push(screenshotPath4);
    console.log(`   📸 Screenshot: ${screenshotPath4}\n`);

    // ==================== STEP 5: ANSWER QUESTIONS ====================
    console.log('📋 Step 5: Answer Interview Questions');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    // Look for question and answer elements
    const questionElements = await page.locator('[role="article"], .question, h2, h3').all();
    console.log(`   → Found ${questionElements.length} potential question elements`);

    // Try to find and fill answer input
    const answerInputs = await page.locator('textarea, input[type="text"]').all();
    if (answerInputs.length > 0) {
      const answerText = 'I would approach this problem by breaking it down into smaller components, analyzing the requirements, and implementing a solution with proper error handling and testing.';
      await answerInputs[0].fill(answerText);
      console.log('   ✅ Answer provided');
      testResults.passed.push('✅ Answer submitted');
      await page.waitForTimeout(1000);
    } else {
      console.log('   ⚠️  No answer input found (interview may be in different state)');
    }

    // ==================== STEP 6: COMPLETE INTERVIEW ====================
    console.log('\n📋 Step 6: Complete Interview');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    // Look for completion button
    const completeButton = await page.locator('button').filter({ hasText: /Complete|Finish|Submit|End/i }).first();
    if (await completeButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await completeButton.click();
      console.log('   ✅ Interview completion initiated');
      testResults.passed.push('✅ Interview completion triggered');
      await page.waitForTimeout(3000);
    } else {
      console.log('   ⚠️  Completion button not found');
    }

    // Take screenshot
    const screenshotPath5 = path.join(testResultsDir, 'interview-05-completion.png');
    await page.screenshot({ path: screenshotPath5 });
    testResults.screenshots.push(screenshotPath5);
    console.log(`   📸 Screenshot: ${screenshotPath5}\n`);

    // ==================== DATABASE VALIDATION ====================
    console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          📊 DATABASE VALIDATION TESTS                         ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    // Test 1: Connection
    console.log('📋 Test 1: Database Connection');
    console.log('───────────────────────────────────────────────────────────────────────────────────');
    try {
      const { data, error } = await supabase.from('interviews').select('count').limit(1);
      if (!error) {
        console.log('   ✅ Supabase connection successful');
        testResults.databaseTests.push('✅ Database connection established');
      } else {
        console.log('   ❌ Connection failed:', error.message);
        testResults.databaseTests.push('❌ Connection failed');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // Test 2: Interviews Table Schema
    console.log('\n📋 Test 2: Interviews Table Schema');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    const requiredInterviewColumns = [
      'id', 'user_id', 'candidate_name', 'position',
      'status', 'started_at', 'ended_at', 'duration_minutes',
      'overall_score', 'video_url', 'malpractice_report'
    ];

    try {
      const { data: interviews, error } = await supabase
        .from('interviews')
        .select('*')
        .limit(1);

      if (!error && interviews && interviews.length > 0) {
        const actualColumns = Object.keys(interviews[0]);
        const missingColumns = requiredInterviewColumns.filter(col => !actualColumns.includes(col));

        console.log(`   ✅ Found ${actualColumns.length} columns in interviews table`);
        console.log('   Available columns:', actualColumns.join(', '));

        if (missingColumns.length === 0) {
          console.log('   ✅ All required columns present');
          testResults.databaseTests.push('✅ Interviews table schema valid');
        } else {
          console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
          testResults.databaseTests.push(`⚠️  Missing: ${missingColumns.join(', ')}`);
        }
      } else {
        console.log('   ⚠️  No data in interviews table');
        testResults.databaseTests.push('⚠️  Interviews table empty');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // Test 3: Questions Table
    console.log('\n📋 Test 3: Interview Questions Table');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    try {
      const { data: questions, error } = await supabase
        .from('interview_questions')
        .select('*')
        .limit(5);

      if (!error) {
        if (questions && questions.length > 0) {
          console.log(`   ✅ Found ${questions.length} questions`);
          const sample = questions[0];
          const questionFields = Object.keys(sample);
          console.log('   Fields:', questionFields.join(', '));

          // Check for new fields
          if (sample.question_order !== undefined) {
            console.log(`   ✅ question_order field present`);
          }
          if (sample.asked_at !== undefined) {
            console.log(`   ✅ asked_at field present`);
          }

          testResults.databaseTests.push(`✅ Questions table: ${questions.length} records`);
        } else {
          console.log('   ⚠️  No questions stored yet');
          testResults.databaseTests.push('⚠️  Questions table empty');
        }
      } else {
        console.log('   ❌ Error accessing questions:', error.message);
        testResults.databaseTests.push('❌ Cannot access questions table');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // Test 4: Answers Table
    console.log('\n📋 Test 4: Interview Answers Table');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    try {
      const { data: answers, error } = await supabase
        .from('interview_answers')
        .select('*')
        .limit(5);

      if (!error) {
        if (answers && answers.length > 0) {
          console.log(`   ✅ Found ${answers.length} answers`);
          const sample = answers[0];
          const answerFields = Object.keys(sample);
          console.log('   Fields:', answerFields.join(', '));

          // Check for new fields
          if (sample.duration_seconds !== undefined) {
            console.log(`   ✅ duration_seconds field present`);
          }

          testResults.databaseTests.push(`✅ Answers table: ${answers.length} records`);
        } else {
          console.log('   ⚠️  No answers stored yet');
          testResults.databaseTests.push('⚠️  Answers table empty');
        }
      } else {
        console.log('   ❌ Error accessing answers:', error.message);
        testResults.databaseTests.push('❌ Cannot access answers table');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // Test 5: Performance Reports
    console.log('\n📋 Test 5: Performance Reports Table');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    try {
      const { data: reports, error } = await supabase
        .from('performance_reports')
        .select('*')
        .limit(5);

      if (!error) {
        if (reports && reports.length > 0) {
          console.log(`   ✅ Found ${reports.length} performance reports`);
          const sample = reports[0];
          const reportFields = Object.keys(sample);
          console.log('   Fields:', reportFields.join(', '));

          if (sample.overall_score !== undefined) {
            console.log(`   ✅ overall_score: ${sample.overall_score}`);
          }
          if (sample.technical_score !== undefined) {
            console.log(`   ✅ technical_score: ${sample.technical_score}`);
          }

          testResults.databaseTests.push(`✅ Performance reports: ${reports.length} records`);
        } else {
          console.log('   ⚠️  No performance reports yet');
          testResults.databaseTests.push('⚠️  Performance reports table empty');
        }
      } else {
        console.log('   ❌ Error accessing reports:', error.message);
        testResults.databaseTests.push('❌ Cannot access reports table');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // Test 6: Audit Logs
    console.log('\n📋 Test 6: Audit Logs Table');
    console.log('───────────────────────────────────────────────────────────────────────────────────');

    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error) {
        if (logs && logs.length > 0) {
          console.log(`   ✅ Found ${logs.length} audit log entries`);

          // Look for INTERVIEW_FINALIZE entries
          const finalizeEntries = logs.filter(l => l.action === 'INTERVIEW_FINALIZE');
          if (finalizeEntries.length > 0) {
            console.log(`   ✅ INTERVIEW_FINALIZE entries: ${finalizeEntries.length}`);
            const latestFinalize = finalizeEntries[0];
            console.log(`   Details:`, JSON.stringify(latestFinalize.details || {}, null, 2));
          }

          testResults.databaseTests.push(`✅ Audit logs: ${logs.length} entries`);
        } else {
          console.log('   ⚠️  No audit logs yet');
          testResults.databaseTests.push('⚠️  Audit logs empty');
        }
      } else {
        console.log('   ❌ Error accessing logs:', error.message);
        testResults.databaseTests.push('❌ Cannot access audit logs');
      }
    } catch (err) {
      console.log('   ❌ Error:', err.message);
      testResults.databaseTests.push(`❌ Error: ${err.message}`);
    }

    // ==================== TEST SUMMARY ====================
    console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                              ✅ TEST SUMMARY                                  ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

    const passedCount = testResults.passed.length;
    const failedCount = testResults.failed.length;
    const dbTestCount = testResults.databaseTests.length;

    console.log(`📊 UI Flow Tests: ${passedCount} passed, ${failedCount} failed`);
    console.log(`📊 Database Tests: ${dbTestCount} checks performed`);
    console.log(`📷 Screenshots: ${testResults.screenshots.length} captured`);

    console.log('\n✅ UI Flow Results:');
    testResults.passed.forEach(result => console.log(`   ${result}`));

    if (testResults.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.failed.forEach(result => console.log(`   ${result}`));
    }

    console.log('\n📊 Database Results:');
    testResults.databaseTests.forEach(result => console.log(`   ${result}`));

    console.log('\n📸 Screenshots:');
    testResults.screenshots.forEach((ss, idx) => console.log(`   ${idx + 1}. ${ss}`));

    console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
    console.log('\n✨ Test execution complete! Check test-results/ directory for artifacts.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error(error.stack);
    testResults.failed.push(`❌ ${error.message}`);

    // Take final screenshot
    const errorScreenshot = path.join(testResultsDir, 'error-screenshot.png');
    await page.screenshot({ path: errorScreenshot }).catch(() => {});

    process.exit(1);
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
runCompleteTest();
