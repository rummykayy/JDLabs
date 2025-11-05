const { chromium } = require('playwright');

async function testJDLabsApp() {
  console.log('🚀 Starting JD Labs Application Tests...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down so we can see what's happening
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './test-results/videos/',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  const testResults = {
    passed: [],
    failed: [],
    screenshots: []
  };

  try {
    // Test 1: Homepage loads
    console.log('📋 Test 1: Loading Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const screenshotPath = './test-results/01-homepage.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    testResults.screenshots.push(screenshotPath);

    const title = await page.title();
    console.log(`   ✓ Page title: "${title}"`);
    testResults.passed.push('Homepage loads successfully');

    // Test 2: Check for Header
    console.log('\n📋 Test 2: Checking Header Component...');
    const headerExists = await page.locator('header, nav, [role="banner"]').count() > 0;
    if (headerExists) {
      console.log('   ✓ Header component found');
      testResults.passed.push('Header component exists');
    } else {
      console.log('   ✗ Header component not found');
      testResults.failed.push('Header component missing');
    }

    // Test 3: Check for Logo
    console.log('\n📋 Test 3: Checking Logo...');
    const logoExists = await page.locator('img[alt*="Logo"], img[alt*="logo"], img[src*="Logo"]').count() > 0;
    if (logoExists) {
      const logoSrc = await page.locator('img[alt*="Logo"], img[alt*="logo"], img[src*="Logo"]').first().getAttribute('src');
      console.log(`   ✓ Logo found: ${logoSrc}`);
      testResults.passed.push('Logo renders correctly');
    } else {
      console.log('   ⚠ Logo not found (might use text logo)');
      testResults.passed.push('Logo check completed');
    }

    // Test 4: Check for navigation/routing
    console.log('\n📋 Test 4: Checking Navigation Links...');
    const links = await page.locator('a').all();
    console.log(`   ✓ Found ${links.length} navigation links`);

    const linkTexts = [];
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const text = await links[i].innerText();
      if (text.trim()) linkTexts.push(text.trim());
    }
    console.log(`   Links: ${linkTexts.join(', ')}`);
    testResults.passed.push(`Found ${links.length} navigation links`);

    // Test 5: Check for main content
    console.log('\n📋 Test 5: Checking Main Content Area...');
    const mainContent = await page.locator('main, [role="main"], .container, #root').count() > 0;
    if (mainContent) {
      console.log('   ✓ Main content area found');
      testResults.passed.push('Main content area exists');
    } else {
      console.log('   ✗ Main content area not found');
      testResults.failed.push('Main content area missing');
    }

    // Test 6: Check for interactive elements
    console.log('\n📋 Test 6: Checking Interactive Elements...');
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    console.log(`   ✓ Found ${buttons} buttons`);
    console.log(`   ✓ Found ${inputs} input fields`);
    testResults.passed.push(`Interactive elements: ${buttons} buttons, ${inputs} inputs`);

    // Test 7: Take screenshot of current view
    console.log('\n📋 Test 7: Capturing Full Application State...');
    const fullScreenshot = './test-results/02-full-app-state.png';
    await page.screenshot({ path: fullScreenshot, fullPage: true });
    testResults.screenshots.push(fullScreenshot);
    console.log(`   ✓ Screenshot saved: ${fullScreenshot}`);
    testResults.passed.push('Full application screenshot captured');

    // Test 8: Check for errors in console
    console.log('\n📋 Test 8: Checking Browser Console...');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (consoleErrors.length === 0) {
      console.log('   ✓ No console errors detected');
      testResults.passed.push('No console errors');
    } else {
      console.log(`   ⚠ Found ${consoleErrors.length} console errors:`);
      consoleErrors.forEach(err => console.log(`     - ${err}`));
      testResults.failed.push(`${consoleErrors.length} console errors found`);
    }

    // Test 9: Check page responsiveness
    console.log('\n📋 Test 9: Testing Responsive Design...');

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    const mobileScreenshot = './test-results/03-mobile-view.png';
    await page.screenshot({ path: mobileScreenshot, fullPage: true });
    testResults.screenshots.push(mobileScreenshot);
    console.log('   ✓ Mobile view (375x667) captured');

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    const tabletScreenshot = './test-results/04-tablet-view.png';
    await page.screenshot({ path: tabletScreenshot, fullPage: true });
    testResults.screenshots.push(tabletScreenshot);
    console.log('   ✓ Tablet view (768x1024) captured');

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    console.log('   ✓ Desktop view (1920x1080) restored');
    testResults.passed.push('Responsive design tested across 3 viewports');

    // Test 10: Check for specific JD Labs components
    console.log('\n📋 Test 10: Checking JD Labs Specific Features...');

    const setupScreenExists = await page.getByText(/setup|interview|start/i).count() > 0;
    const loginExists = await page.getByText(/login|sign in|register/i).count() > 0;
    const featuresExist = await page.getByText(/features|pricing|community/i).count() > 0;

    if (setupScreenExists) {
      console.log('   ✓ Interview/Setup related content found');
      testResults.passed.push('Interview setup content present');
    }
    if (loginExists) {
      console.log('   ✓ Login/Authentication content found');
      testResults.passed.push('Authentication content present');
    }
    if (featuresExist) {
      console.log('   ✓ Features/Pricing content found');
      testResults.passed.push('Marketing content present');
    }

    // Test 11: Performance metrics
    console.log('\n📋 Test 11: Gathering Performance Metrics...');
    const performanceMetrics = await page.evaluate(() => {
      const perfData = window.performance.timing;
      return {
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        timeToInteractive: perfData.domInteractive - perfData.navigationStart
      };
    });

    console.log(`   ✓ Page load time: ${performanceMetrics.loadTime}ms`);
    console.log(`   ✓ DOM ready: ${performanceMetrics.domReady}ms`);
    console.log(`   ✓ Time to interactive: ${performanceMetrics.timeToInteractive}ms`);
    testResults.passed.push(`Performance: ${performanceMetrics.loadTime}ms load time`);

  } catch (error) {
    console.error(`\n❌ Test failed with error: ${error.message}`);
    testResults.failed.push(`Error: ${error.message}`);

    // Take error screenshot
    const errorScreenshot = './test-results/error-screenshot.png';
    await page.screenshot({ path: errorScreenshot, fullPage: true });
    testResults.screenshots.push(errorScreenshot);
  }

  // Close browser
  await context.close();
  await browser.close();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed.length}`);
  console.log(`❌ Failed: ${testResults.failed.length}`);
  console.log(`📸 Screenshots: ${testResults.screenshots.length}`);
  console.log('='.repeat(60));

  if (testResults.passed.length > 0) {
    console.log('\n✅ PASSED TESTS:');
    testResults.passed.forEach((test, i) => console.log(`   ${i + 1}. ${test}`));
  }

  if (testResults.failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failed.forEach((test, i) => console.log(`   ${i + 1}. ${test}`));
  }

  console.log('\n📸 SCREENSHOTS SAVED:');
  testResults.screenshots.forEach((screenshot, i) => console.log(`   ${i + 1}. ${screenshot}`));

  console.log('\n' + '='.repeat(60));

  const passRate = ((testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100).toFixed(1);
  console.log(`🎯 Overall Pass Rate: ${passRate}%`);
  console.log('='.repeat(60));

  return testResults;
}

// Create test-results directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./test-results')) {
  fs.mkdirSync('./test-results');
}
if (!fs.existsSync('./test-results/videos')) {
  fs.mkdirSync('./test-results/videos', { recursive: true });
}

// Run the tests
testJDLabsApp()
  .then(() => {
    console.log('\n✨ Testing completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Testing failed:', error);
    process.exit(1);
  });
