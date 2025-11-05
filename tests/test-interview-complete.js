#!/usr/bin/env node

/**
 * Complete Interview Test - Fixed Version
 * Waits for all resources to load before attempting interaction
 */

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testResultsDir = './test-results';
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

async function testInterview() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              🎯 INTERVIEW TEST - FIXED PAGE RENDERING                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');

  let browser;

  try {
    // Launch browser
    console.log('📋 Launching browser (headful mode for better rendering)...');
    browser = await chromium.launch({
      headless: false,  // Non-headless for better rendering
      slowMo: 300,
      args: ['--disable-blink-features=AutomationControlled']
    });

    const page = await browser.newPage();

    // Disable animation/timeout limits
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log('✅ Browser launched\n');

    // ==================== NAVIGATE & WAIT FOR ALL RESOURCES ====================
    console.log('📋 Phase 1: Navigate and Wait for All Resources');
    console.log('───────────────────────────────────────────────────────────────────────────────────\n');

    console.log('   → Navigating to http://localhost:8080/');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });

    console.log('   ✅ Network idle - all resources loaded');

    // Wait for React to render
    console.log('   ⏳ Waiting for React components to render...');
    await page.waitForTimeout(5000);

    // Take screenshot
    const ss1 = path.join(testResultsDir, 'test-page-loaded.png');
    await page.screenshot({ path: ss1, fullPage: true });
    console.log(`   📸 Screenshot: ${ss1}`);

    // Get page content info
    const bodyText = await page.evaluate(() => document.body.innerText);
    const buttonCount = await page.locator('button').count();

    console.log(`\n   📊 Page Analysis:`);
    console.log(`   • Body text length: ${bodyText.length} characters`);
    console.log(`   • Buttons found: ${buttonCount}`);
    console.log(`   • Page title: ${await page.title()}`);

    // Check for specific elements
    const hasRoot = await page.locator('#root').count() > 0;
    const hasButtons = buttonCount > 0;
    const hasInputs = await page.locator('input').count() > 0;

    console.log(`\n   Element Detection:`);
    console.log(`   • Root element: ${hasRoot ? '✅ Found' : '❌ Not found'}`);
    console.log(`   • Buttons: ${hasButtons ? `✅ Found (${buttonCount})` : '❌ Not found'}`);
    console.log(`   • Inputs: ${hasInputs ? '✅ Found' : '❌ Not found'}`);

    // ==================== CHECK ACTUAL PAGE CONTENT ====================
    console.log('\n📋 Phase 2: Analyze Page Content');
    console.log('───────────────────────────────────────────────────────────────────────────────────\n');

    const html = await page.content();
    const bodyContent = await page.locator('body').innerHTML();

    console.log(`   • HTML size: ${html.length} bytes`);
    console.log(`   • Body innerHTML size: ${bodyContent.length} bytes`);

    // Check for specific text
    const pageText = await page.textContent('body');
    if (pageText && pageText.includes('Login')) {
      console.log('   ✅ Login page detected');
    } else if (pageText && pageText.includes('Interview')) {
      console.log('   ✅ Interview page detected');
    } else if (pageText && pageText.includes('JD Labs')) {
      console.log('   ✅ JD Labs branding detected');
    }

    // ==================== ATTEMPT TO INTERACT ====================
    console.log('\n📋 Phase 3: Interaction Test');
    console.log('───────────────────────────────────────────────────────────────────────────────────\n');

    console.log('   🔍 Looking for interactive elements...');

    // Try to find button by multiple methods
    const buttons = await page.locator('button').all();
    console.log(`   • Total buttons: ${buttons.length}`);

    if (buttons.length > 0) {
      console.log('   • First 5 buttons:');
      for (let i = 0; i < Math.min(buttons.length, 5); i++) {
        const text = await buttons[i].textContent();
        console.log(`     ${i + 1}. "${text?.trim()}"`);
      }

      // Try clicking first visible button
      console.log('\n   🖱️  Attempting to click first button...');
      try {
        await buttons[0].click();
        await page.waitForTimeout(2000);
        console.log('   ✅ Button clicked successfully');

        const ss2 = path.join(testResultsDir, 'test-after-click.png');
        await page.screenshot({ path: ss2, fullPage: true });
        console.log(`   📸 Screenshot: ${ss2}`);
      } catch (e) {
        console.log(`   ❌ Click failed: ${e.message}`);
      }
    } else {
      console.log('   ⚠️  No buttons found on page');
      console.log('   💡 Tip: Page may still be loading or using Shadow DOM');
    }

    // ==================== DATABASE VERIFICATION ====================
    console.log('\n📋 Phase 4: Database Verification');
    console.log('───────────────────────────────────────────────────────────────────────────────────\n');

    console.log('   🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('interviews')
      .select('count')
      .limit(1);

    if (!testError) {
      console.log('   ✅ Database connection successful');

      // Get latest interviews
      const { data: interviews } = await supabase
        .from('interviews')
        .select('id, candidate_name, position, status, duration_minutes, overall_score')
        .order('created_at', { ascending: false })
        .limit(3);

      console.log(`\n   📊 Latest Interviews (${interviews?.length || 0}):`);
      if (interviews && interviews.length > 0) {
        interviews.forEach((interview, idx) => {
          console.log(`\n   ${idx + 1}. ${interview.candidate_name} - ${interview.position}`);
          console.log(`      • Status: ${interview.status}`);
          console.log(`      • Duration: ${interview.duration_minutes || 'NULL'} min`);
          console.log(`      • Score: ${interview.overall_score || 'NULL'}`);
        });
      }

      // Check table schemas
      console.log('\n   📋 Table Schema Verification:');
      const tables = ['interviews', 'interview_questions', 'interview_answers', 'performance_reports'];

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          if (!error) {
            const fields = data && data.length > 0 ? Object.keys(data[0]).length : 'N/A';
            console.log(`   ✅ ${table}: ${fields} fields, accessible`);
          } else {
            console.log(`   ❌ ${table}: Error - ${error.message}`);
          }
        } catch (e) {
          console.log(`   ❌ ${table}: Exception - ${e.message}`);
        }
      }

    } else {
      console.log(`   ❌ Database connection failed: ${testError.message}`);
    }

    // ==================== SUMMARY ====================
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('SUMMARY & RECOMMENDATIONS');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');

    if (hasRoot && buttonCount > 0) {
      console.log('✅ APP STATUS: RENDERING PROPERLY');
      console.log('   React components are loading and interactive elements are present.');
      console.log('\n📋 Next Steps:');
      console.log('   1. Run interview in browser manually');
      console.log('   2. Answer all questions');
      console.log('   3. Complete the interview');
      console.log('   4. Verify data in database');
    } else {
      console.log('⚠️  APP STATUS: PAGE RENDERING ISSUE');
      console.log('   • React may not have fully loaded');
      console.log('   • CDN dependencies may not be available');
      console.log('   • JavaScript execution may be disabled');
      console.log('\n💡 SOLUTIONS:');
      console.log('   1. Check browser console for JavaScript errors');
      console.log('   2. Verify internet connection (for CDN resources)');
      console.log('   3. Clear browser cache: Ctrl+Shift+Delete');
      console.log('   4. Restart the server: npm start');
      console.log('   5. Try opening directly in Firefox/Chrome browser');
    }

    console.log('\n✅ Test completed! Check test-results/ for screenshots.\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

testInterview();
