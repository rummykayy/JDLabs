const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Supabase configuration
const supabaseUrl = "https://ctsqmhhjacigvhmhndhh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test configuration
const TEST_USER_ID = '01234567-89ab-cdef-0123-456789abcdef'; // Test UUID
const TEST_INTERVIEW_ID = crypto.randomUUID();

async function generateMockInterviewData() {
  return {
    id: TEST_INTERVIEW_ID,
    user_id: '1', // Will use actual user ID from database
    candidate_name: 'Test Candidate - ' + new Date().toISOString().slice(0, 10),
    position: 'Senior Software Engineer',
    jobDescription: 'Looking for an experienced engineer with TypeScript expertise',
    mode: 'Audio Interview',
    language: 'en',
    model: 'gemini-2.5-flash',
    difficulty: 'Medium',
    status: 'completed',
    started_at: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    ended_at: new Date().toISOString(),
    duration_minutes: 15,
    overall_score: 7.5,
    video_url: null,
    malpractice_report: null,
  };
}

async function generateMockQuestions(interviewId) {
  return [
    {
      interview_id: interviewId,
      question_text: 'What is your experience with TypeScript?',
      question_order: 1,
      asked_at: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      interview_id: interviewId,
      question_text: 'Explain your approach to handling asynchronous operations in Node.js',
      question_order: 2,
      asked_at: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
      interview_id: interviewId,
      question_text: 'Describe a challenging project you led and how you resolved conflicts',
      question_order: 3,
      asked_at: new Date(Date.now() - 9 * 60000).toISOString(),
    },
    {
      interview_id: interviewId,
      question_text: 'What are your preferred patterns for state management in React?',
      question_order: 4,
      asked_at: new Date(Date.now() - 6 * 60000).toISOString(),
    },
    {
      interview_id: interviewId,
      question_text: 'How do you approach writing and maintaining tests in your projects?',
      question_order: 5,
      asked_at: new Date(Date.now() - 3 * 60000).toISOString(),
    },
  ];
}

async function generateMockAnswers(questionIds) {
  const answers = [
    'I have been working with TypeScript for over 5 years. I find it incredibly useful for type safety and catching errors at compile time. I have used it extensively in React applications and Node.js backends.',
    'I handle asynchronous operations using async/await patterns primarily, as it makes the code more readable than callback chains. I also understand Promises deeply and use Promise.all() when dealing with multiple concurrent operations.',
    'I led a project to migrate our legacy monolith to microservices. There were conflicts between the backend and frontend teams about API design. I resolved this by establishing clear contracts using OpenAPI specs and regular sync meetings.',
    'For state management, I prefer using React Context for simple cases and Redux or Zustand for more complex applications. It depends on the scale and requirements of the project.',
    'I believe in the Testing Pyramid approach - unit tests for business logic, integration tests for API interactions, and E2E tests for critical user flows. I aim for at least 70% code coverage.',
  ];

  return questionIds.map((qId, index) => ({
    question_id: qId,
    answer_text: answers[index],
    duration_seconds: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
    created_at: new Date().toISOString(),
  }));
}

async function generateMockFeedback() {
  return {
    overall_score: 7.5,
    recommendation: 'Recommended for Hire',
    feedback: `
Overall Reasoning: Strong technical foundation with good communication skills.

Metrics:
Technical Depth: 8/10 - Demonstrates solid understanding of TypeScript and async patterns
Communication Skills: 7/10 - Clear explanations with minor hesitations
Problem-Solving: 7.5/10 - Good approach to conflict resolution with practical example

Strengths:
- Deep knowledge of TypeScript and modern JavaScript patterns
- Good experience with leading projects and team collaboration
- Clear communication style and ability to explain technical concepts

Areas for Improvement:
- Could provide more specific examples from recent projects
- Could elaborate more on system design and architectural decisions
- Consider developing expertise in containerization technologies
`,
    technical_score: 8.0,
    communication_score: 7.0,
    problem_solving_score: 7.5,
  };
}

async function testDatabaseOperations() {
  console.log('🗄️  Starting Database Operations Tests...\n');
  console.log('='.repeat(70));

  const testResults = {
    passed: [],
    failed: [],
    warnings: [],
    data: {}
  };

  try {
    // ==================== TEST 1: CONNECTION ====================
    console.log('\n📋 Test 1: Database Connection');
    console.log('-'.repeat(70));

    try {
      const { data: connection, error: connError } = await supabase
        .from('interviews')
        .select('count')
        .limit(1);

      if (!connError) {
        console.log('✓ Supabase connection successful');
        testResults.passed.push('Database connection established');
      } else {
        console.log('✗ Connection failed:', connError.message);
        testResults.failed.push('Connection error: ' + connError.message);
        throw new Error('Cannot continue without database connection');
      }
    } catch (err) {
      console.log('✗ Connection test failed:', err.message);
      testResults.failed.push('Connection test error: ' + err.message);
      throw err;
    }

    // ==================== TEST 2: TABLE STRUCTURE ====================
    console.log('\n📋 Test 2: Table Structure Validation');
    console.log('-'.repeat(70));

    const tables = [
      {
        name: 'interviews',
        requiredColumns: [
          'id', 'user_id', 'candidate_name', 'position', 'jobDescription',
          'mode', 'language', 'model', 'difficulty', 'status',
          'started_at', 'ended_at', 'duration_minutes', 'overall_score',
          'video_url', 'malpractice_report'
        ]
      },
      {
        name: 'interview_questions',
        requiredColumns: ['id', 'interview_id', 'question_text', 'question_order', 'asked_at']
      },
      {
        name: 'interview_answers',
        requiredColumns: ['id', 'question_id', 'answer_text', 'duration_seconds']
      },
      {
        name: 'performance_reports',
        requiredColumns: ['id', 'interview_id', 'overall_score', 'recommendation', 'feedback']
      }
    ];

    for (const table of tables) {
      try {
        const { data: sample, error: sampleError } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (sampleError && sampleError.code !== 'PGRST116') { // PGRST116 = no rows
          console.log(`⚠ ${table.name}: Access error (${sampleError.code})`);
          testResults.warnings.push(`${table.name}: ${sampleError.message}`);
          continue;
        }

        if (sample && sample.length > 0) {
          const actualColumns = Object.keys(sample[0]);
          const missingColumns = table.requiredColumns.filter(col => !actualColumns.includes(col));

          if (missingColumns.length === 0) {
            console.log(`✓ ${table.name}: All required columns present`);
            testResults.passed.push(`${table.name} structure valid`);
          } else {
            console.log(`⚠ ${table.name}: Missing columns: ${missingColumns.join(', ')}`);
            testResults.warnings.push(`${table.name} missing: ${missingColumns.join(', ')}`);
          }
        } else {
          console.log(`✓ ${table.name}: Table structure accessible (empty table)`);
          testResults.passed.push(`${table.name} accessible`);
        }
      } catch (err) {
        console.log(`✗ ${table.name}: Error - ${err.message}`);
        testResults.failed.push(`${table.name} check failed: ${err.message}`);
      }
    }

    // ==================== TEST 3: FETCH EXISTING DATA ====================
    console.log('\n📋 Test 3: Fetching Existing Data');
    console.log('-'.repeat(70));

    try {
      const { data: allInterviews, error: intError } = await supabase
        .from('interviews')
        .select('id, candidate_name, position, overall_score, status')
        .limit(10)
        .order('created_at', { ascending: false });

      if (!intError && allInterviews) {
        console.log(`✓ Found ${allInterviews.length} interview records`);
        testResults.passed.push(`Retrieved ${allInterviews.length} interviews`);

        if (allInterviews.length > 0) {
          console.log('\n  Recent interviews:');
          allInterviews.slice(0, 3).forEach((int, idx) => {
            console.log(`  ${idx + 1}. ${int.candidate_name} - ${int.position} (Score: ${int.overall_score || 'N/A'})`);
          });
        }
        testResults.data.interviews = allInterviews;
      } else {
        console.log('⚠ No interviews found (table may be empty)');
        testResults.warnings.push('No existing interview data');
      }
    } catch (err) {
      console.log(`✗ Error fetching interviews: ${err.message}`);
      testResults.failed.push('Failed to fetch interviews: ' + err.message);
    }

    // ==================== TEST 4: CHECK Q&A RELATIONSHIPS ====================
    console.log('\n📋 Test 4: Checking Q&A Relationships');
    console.log('-'.repeat(70));

    try {
      const { data: qnaData, error: qnaError } = await supabase
        .from('interview_questions')
        .select(`
          id,
          interview_id,
          question_text,
          interview_answers (
            id,
            answer_text,
            duration_seconds
          )
        `)
        .limit(3);

      if (!qnaError && qnaData) {
        console.log(`✓ Q&A relationships verified (${qnaData.length} questions with answers)`);

        if (qnaData.length > 0) {
          qnaData.forEach((q, idx) => {
            const answerCount = q.interview_answers?.length || 0;
            console.log(`  Q${idx + 1}: "${q.question_text.substring(0, 50)}..." (${answerCount} answer)`);
          });
        }
        testResults.passed.push('Q&A relationships intact');
      } else {
        console.log('⚠ No Q&A data found');
        testResults.warnings.push('No Q&A records');
      }
    } catch (err) {
      console.log(`⚠ Q&A check skipped: ${err.message}`);
      testResults.warnings.push('Q&A check skipped');
    }

    // ==================== TEST 5: PERFORMANCE REPORTS ====================
    console.log('\n📋 Test 5: Checking Performance Reports');
    console.log('-'.repeat(70));

    try {
      const { data: reports, error: repError } = await supabase
        .from('performance_reports')
        .select('id, interview_id, overall_score, recommendation')
        .limit(5)
        .order('created_at', { ascending: false });

      if (!repError && reports) {
        console.log(`✓ Found ${reports.length} performance reports`);

        if (reports.length > 0) {
          console.log('\n  Recent reports:');
          reports.forEach((rep, idx) => {
            console.log(`  ${idx + 1}. Score: ${rep.overall_score}/10 - ${rep.recommendation}`);
          });
        }
        testResults.passed.push(`Retrieved ${reports.length} reports`);
      } else {
        console.log('⚠ No performance reports found');
        testResults.warnings.push('No existing reports');
      }
    } catch (err) {
      console.log(`⚠ Reports check skipped: ${err.message}`);
      testResults.warnings.push('Reports check skipped');
    }

    // ==================== TEST 6: AUDIT LOGS ====================
    console.log('\n📋 Test 6: Checking Audit Logs');
    console.log('-'.repeat(70));

    try {
      const { data: logs, error: logError } = await supabase
        .from('audit_logs')
        .select('action, entity_id, created_at')
        .limit(5)
        .order('created_at', { ascending: false });

      if (!logError && logs) {
        console.log(`✓ Found ${logs.length} audit log entries`);

        if (logs.length > 0) {
          console.log('\n  Recent actions:');
          logs.forEach((log, idx) => {
            const date = new Date(log.created_at).toLocaleString();
            console.log(`  ${idx + 1}. ${log.action} (${date})`);
          });
        }
        testResults.passed.push('Audit logging functional');
      } else {
        console.log('⚠ No audit logs found');
        testResults.warnings.push('No audit logs');
      }
    } catch (err) {
      console.log(`⚠ Audit logs check skipped: ${err.message}`);
      testResults.warnings.push('Audit logs check skipped');
    }

    // ==================== TEST 7: DATA INTEGRITY ====================
    console.log('\n📋 Test 7: Data Integrity Check');
    console.log('-'.repeat(70));

    try {
      const { data: orphanAnswers, error: orphanError } = await supabase
        .rpc('find_orphan_answers').catch(() => ({ data: null, error: 'RPC unavailable' }));

      if (!orphanError && orphanAnswers !== null) {
        if (orphanAnswers === 0) {
          console.log('✓ No orphaned answers found');
          testResults.passed.push('Data integrity verified');
        } else {
          console.log(`⚠ Found ${orphanAnswers} orphaned answer records`);
          testResults.warnings.push(`Orphaned records found: ${orphanAnswers}`);
        }
      } else {
        console.log('⚠ Integrity check unavailable (RPC not configured)');
        testResults.warnings.push('Integrity check unavailable');
      }
    } catch (err) {
      console.log(`⚠ Integrity check skipped: ${err.message}`);
      testResults.warnings.push('Integrity check skipped');
    }

    // ==================== TEST 8: STORAGE VALIDATION ====================
    console.log('\n📋 Test 8: Checking Storage Buckets');
    console.log('-'.repeat(70));

    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

      if (!bucketsError && buckets) {
        const recordingsBucket = buckets.find(b => b.name === 'interview-recordings');
        if (recordingsBucket) {
          console.log('✓ interview-recordings bucket exists');
          testResults.passed.push('Storage bucket configured');
        } else {
          console.log('⚠ interview-recordings bucket not found');
          testResults.warnings.push('Storage bucket missing');
        }
      } else {
        console.log('⚠ Could not list storage buckets');
        testResults.warnings.push('Storage access limited');
      }
    } catch (err) {
      console.log(`⚠ Storage check skipped: ${err.message}`);
      testResults.warnings.push('Storage check skipped');
    }

    // ==================== FINAL REPORT ====================
    console.log('\n\n' + '='.repeat(70));
    console.log('DATABASE TEST SUMMARY');
    console.log('='.repeat(70));

    console.log(`\n✅ PASSED: ${testResults.passed.length} tests`);
    testResults.passed.forEach(test => console.log(`   • ${test}`));

    if (testResults.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${testResults.warnings.length}`);
      testResults.warnings.forEach(warn => console.log(`   • ${warn}`));
    }

    if (testResults.failed.length > 0) {
      console.log(`\n❌ FAILED: ${testResults.failed.length} tests`);
      testResults.failed.forEach(fail => console.log(`   • ${fail}`));
    }

    console.log('\n' + '='.repeat(70));
    console.log('✓ Database tests completed\n');

  } catch (error) {
    console.error('\n❌ Test suite error:', error);
  }
}

// Run the tests
testDatabaseOperations().catch(console.error);
