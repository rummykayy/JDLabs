#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const testsDir = __dirname;

// Create test results directory if it doesn't exist
const resultsDir = path.join(testsDir, 'test-results');
const videosDir = path.join(resultsDir, 'videos');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

console.log('🧪 JD Labs Test Suite Runner\n');
console.log('='.repeat(70));
console.log('Running all interview and database tests...\n');

const tests = [
  {
    name: 'Database Operations Tests',
    file: 'test-database-operations.js',
    description: 'Validates database schema, integrity, and data persistence'
  },
  {
    name: 'Interview Flow Tests',
    file: 'test-interview-flow.js',
    description: 'End-to-end Playwright tests for interview UI and data flow'
  }
];

let completedTests = 0;
let failedTests = 0;

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n${'▶'.repeat(3)} Running: ${test.name}`);
    console.log(`   ${test.description}`);
    console.log('   ' + '-'.repeat(60));

    const testPath = path.join(testsDir, test.file);

    if (!fs.existsSync(testPath)) {
      console.log(`   ✗ Test file not found: ${test.file}\n`);
      failedTests++;
      resolve();
      return;
    }

    const proc = spawn('node', [testPath], {
      cwd: testsDir,
      stdio: 'inherit',
      env: { ...process.env }
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log(`\n   ✓ ${test.name} completed successfully`);
        completedTests++;
      } else {
        console.log(`\n   ✗ ${test.name} exited with code ${code}`);
        failedTests++;
      }
      resolve();
    });

    proc.on('error', (err) => {
      console.log(`\n   ✗ Error running ${test.name}: ${err.message}`);
      failedTests++;
      resolve();
    });
  });
}

async function main() {
  try {
    // Run tests sequentially
    for (const test of tests) {
      await runTest(test);
      // Add delay between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('TEST SUITE SUMMARY');
    console.log('='.repeat(70));

    console.log(`\n✅ Completed: ${completedTests}/${tests.length}`);
    if (failedTests > 0) {
      console.log(`❌ Failed: ${failedTests}/${tests.length}`);
    }

    console.log(`\n📂 Test Results:
   • Results directory: ${resultsDir}
   • Video recordings: ${videosDir}
   • Screenshots and logs saved\n`);

    console.log('For detailed results, check the test-results directory.\n');
    console.log('='.repeat(70) + '\n');

    process.exit(failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Test runner error:', error);
    process.exit(1);
  }
}

main();
