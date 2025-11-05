#!/usr/bin/env node

// ============================================================================
// JD Labs Interview Platform - Database Population Script
// ============================================================================
// Purpose: Populate Supabase database with comprehensive sample data
// Usage: npm run seed
// ============================================================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const {
  languages,
  jobs,
  interviews,
  questionsByPosition,
  defaultQuestions,
  generateAnswer,
  daysAgo,
} = require('./sample-data');

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗');
  console.error('\n💡 Please ensure both are set in your .env file');
  process.exit(1);
}

// Initialize Supabase with service role (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  warning: (msg) => console.warn(`⚠️  ${msg}`),
  section: (msg) => console.log(`\n${'='.repeat(70)}\n${msg}\n${'='.repeat(70)}`),
};

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// SMART MODE: Check what exists and only add missing data
// ============================================================================

async function checkExistingData() {
  log.info('Checking existing data...');

  const counts = {
    languages: 0,
    jobs: 0,
    interviews: 0,
    questions: 0,
    answers: 0,
    reports: 0,
  };

  try {
    const { count: langCount } = await supabase
      .from('languages')
      .select('*', { count: 'exact', head: true });
    counts.languages = langCount || 0;

    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true });
    counts.jobs = jobCount || 0;

    const { count: intCount } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true });
    counts.interviews = intCount || 0;

    const { count: qCount } = await supabase
      .from('interview_questions')
      .select('*', { count: 'exact', head: true });
    counts.questions = qCount || 0;

    const { count: aCount } = await supabase
      .from('interview_answers')
      .select('*', { count: 'exact', head: true });
    counts.answers = aCount || 0;

    const { count: rCount } = await supabase
      .from('performance_reports')
      .select('*', { count: 'exact', head: true });
    counts.reports = rCount || 0;

    log.info(`Current data: Languages=${counts.languages}, Jobs=${counts.jobs}, Interviews=${counts.interviews}`);

    return counts;
  } catch (error) {
    log.error(`Failed to check existing data: ${error.message}`);
    return counts;
  }
}

// ============================================================================
// POPULATION FUNCTIONS
// ============================================================================

async function populateLanguages(existing) {
  log.section('PHASE 1: Populating Languages');

  if (existing.languages >= 10) {
    log.info(`Skipping: ${existing.languages} languages already exist`);
    return;
  }

  try {
    let inserted = 0;
    for (const lang of languages) {
      const { error } = await supabase
        .from('languages')
        .upsert(lang, { onConflict: 'code' });

      if (error) {
        log.warning(`Failed to insert ${lang.name}: ${error.message}`);
      } else {
        inserted++;
      }
    }

    log.success(`Inserted/updated ${inserted} languages`);
  } catch (error) {
    log.error(`Language population failed: ${error.message}`);
    throw error;
  }
}

async function getUserMapping() {
  log.info('Fetching user mapping...');

  const { data: users, error } = await supabase
    .from('users')
    .select('id, userid, email')
    .order('created_at', { ascending: true });

  if (error || !users || users.length === 0) {
    log.error('No users found. Please ensure at least one user exists.');
    log.info('Create a user by signing up through the application first.');
    throw new Error('No users available');
  }

  log.success(`Found ${users.length} users`);
  return users;
}

async function populateJobs(users, existing) {
  log.section('PHASE 2: Populating Jobs');

  if (existing.jobs >= 10) {
    log.info(`Skipping: ${existing.jobs} jobs already exist`);
    return;
  }

  const insertedJobs = [];

  try {
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const user = users[i % users.length];

      const jobData = {
        id: generateUUID(),
        ...job,
        created_by: user.userid,
        created_at: daysAgo(30 - i, 10),
      };

      const { data, error } = await supabase
        .from('jobs')
        .insert(jobData)
        .select()
        .single();

      if (error) {
        log.warning(`Failed to insert job "${job.title}": ${error.message}`);
      } else {
        log.success(`Inserted: ${job.title}`);
        insertedJobs.push(data);
      }

      await sleep(50);
    }

    log.success(`Total jobs inserted: ${insertedJobs.length}`);
    return insertedJobs;
  } catch (error) {
    log.error(`Job population failed: ${error.message}`);
    throw error;
  }
}

async function populateInterviews(users, existing) {
  log.section('PHASE 3: Populating Interviews');

  if (existing.interviews >= 15) {
    log.info(`Skipping: ${existing.interviews} interviews already exist`);
    return [];
  }

  const insertedInterviews = [];

  try {
    for (const intData of interviews) {
      const user = users[0]; // Use first user (existing user)

      const interviewId = generateUUID();
      const startTime = daysAgo(intData.days_ago, 10);
      const endTime = intData.duration_minutes
        ? new Date(new Date(startTime).getTime() + intData.duration_minutes * 60000).toISOString()
        : null;

      const interview = {
        id: interviewId,
        user_id: user.id,
        candidate_name: intData.candidate_name,
        position: intData.position,
        jobDescription: intData.jobDescription || `Interview for ${intData.position} position`,
        mode: intData.mode,
        language: intData.language,
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        difficulty: intData.difficulty,
        status: intData.status,
        started_at: intData.status !== 'lobby' ? startTime : null,
        ended_at: intData.status === 'completed' ? endTime : null,
        duration_minutes: intData.duration_minutes,
        overall_score: intData.overall_score,
        video_url: intData.has_video ? `${user.userid}/recordings/${interviewId}.webm` : null,
        malpractice_report: intData.malpractice_report,
        created_at: daysAgo(intData.days_ago, 11),
      };

      const { data, error } = await supabase
        .from('interviews')
        .insert(interview)
        .select()
        .single();

      if (error) {
        log.warning(`Failed to insert interview for ${intData.candidate_name}: ${error.message}`);
      } else {
        log.success(`Inserted: ${intData.candidate_name} - ${intData.position}`);
        insertedInterviews.push({ ...data, _originalData: intData, _user: user });
      }

      await sleep(50);
    }

    log.success(`Total interviews inserted: ${insertedInterviews.length}`);
    return insertedInterviews;
  } catch (error) {
    log.error(`Interview population failed: ${error.message}`);
    throw error;
  }
}

async function populateQuestionsAndAnswers(insertedInterviews) {
  log.section('PHASE 4: Populating Questions & Answers');

  let totalQuestions = 0;
  let totalAnswers = 0;

  try {
    for (const interview of insertedInterviews) {
      if (interview.status !== 'completed') continue;

      const position = interview.position;
      const questions = questionsByPosition[position] || defaultQuestions;
      const numQuestions = interview.difficulty === 'Hard' ? 7 : interview.difficulty === 'Medium' ? 6 : 5;
      const selectedQuestions = questions.slice(0, Math.min(numQuestions, questions.length));

      const questionRecords = selectedQuestions.map((q, index) => ({
        id: generateUUID(),
        interview_id: interview.id,
        question_text: q,
        question_order: index + 1,
        asked_at: new Date(
          new Date(interview.started_at).getTime() + index * 5 * 60000
        ).toISOString(),
      }));

      const { data: insertedQuestions, error: qError } = await supabase
        .from('interview_questions')
        .insert(questionRecords)
        .select();

      if (qError) {
        log.warning(`Failed to insert questions for ${interview.candidate_name}: ${qError.message}`);
        continue;
      }

      totalQuestions += insertedQuestions.length;

      const answerRecords = insertedQuestions.map((q) => ({
        id: generateUUID(),
        interview_id: interview.id,
        question_id: q.id,
        answer_text: generateAnswer(q.question_text, interview.overall_score || 75),
        duration_seconds: Math.floor(30 + Math.random() * 60),
      }));

      const { data: insertedAnswers, error: aError } = await supabase
        .from('interview_answers')
        .insert(answerRecords)
        .select();

      if (aError) {
        log.warning(`Failed to insert answers for ${interview.candidate_name}: ${aError.message}`);
        continue;
      }

      totalAnswers += insertedAnswers.length;
      log.success(`Added ${insertedQuestions.length} Q&A pairs for ${interview.candidate_name}`);

      await sleep(50);
    }

    log.success(`Total questions: ${totalQuestions}, Total answers: ${totalAnswers}`);
  } catch (error) {
    log.error(`Q&A population failed: ${error.message}`);
    throw error;
  }
}

async function populatePerformanceReports(insertedInterviews) {
  log.section('PHASE 5: Populating Performance Reports');

  let totalReports = 0;

  try {
    for (const interview of insertedInterviews) {
      if (interview.status !== 'completed' || !interview.overall_score) continue;

      const score = interview.overall_score;
      // Scores must be 0-9.99 due to NUMERIC(3,2) constraint
      const technicalScore = Math.min(9.99, Math.max(0, (score / 10) - 0.01));
      const communicationScore = Math.min(9.99, Math.max(0, technicalScore - (Math.random() * 1)));
      const problemSolvingScore = Math.min(9.99, Math.max(0, technicalScore - (Math.random() * 1)));

      let recommendation;
      if (score >= 85) recommendation = 'Recommended for Hire';
      else if (score >= 70) recommendation = 'Needs Improvement';
      else recommendation = 'Not a Fit';

      const feedback = `Overall Reasoning:
${interview.candidate_name} demonstrated ${score >= 85 ? 'excellent' : score >= 70 ? 'good' : 'limited'} technical knowledge for the ${interview.position} position.

Metrics:
Technical: ${technicalScore.toFixed(2)}/10
Communication: ${communicationScore.toFixed(2)}/10
Problem Solving: ${problemSolvingScore.toFixed(2)}/10

Strengths:
${score >= 85 ? '- Deep technical expertise\n- Excellent communication\n- Strong analytical skills' : score >= 70 ? '- Solid fundamentals\n- Good communication\n- Practical experience' : '- Enthusiasm for learning\n- Basic understanding'}

Areas for Improvement:
${score >= 85 ? '- Could expand on testing strategies' : score >= 70 ? '- Deepen knowledge in advanced topics' : '- Significant gaps in technical knowledge'}

${interview.malpractice_report ? `Malpractice Concerns:\n${interview.malpractice_report}\n` : ''}
Recommendation: ${recommendation}`;

      const report = {
        id: generateUUID(),
        interview_id: interview.id,
        interviewer_id: interview._user.userid,
        overall_score: score,
        technical_score: technicalScore,
        communication_score: communicationScore,
        problem_solving_score: problemSolvingScore,
        feedback,
        recommendation,
      };

      const { error } = await supabase
        .from('performance_reports')
        .insert(report);

      if (error) {
        log.warning(`Failed to insert report for ${interview.candidate_name}: ${error.message}`);
      } else {
        log.success(`Created report for ${interview.candidate_name} (Score: ${score})`);
        totalReports++;
      }

      await sleep(50);
    }

    log.success(`Total performance reports: ${totalReports}`);
  } catch (error) {
    log.error(`Performance report population failed: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// VERIFICATION FUNCTION
// ============================================================================

async function verifyData() {
  log.section('VERIFICATION: Final Counts');

  try {
    const tables = [
      'languages', 'users', 'jobs', 'interviews',
      'interview_questions', 'interview_answers',
      'performance_reports', 'comments', 'audit_logs'
    ];

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        log.warning(`Failed to count ${table}: ${error.message}`);
      } else {
        console.log(`  ${table.padEnd(25)} ${count || 0}`);
      }
    }

    log.success('Verification completed!');
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const startTime = Date.now();

  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   JD Labs Interview Platform - Database Population (SMART MODE)  ║
║   Version 1.0                                                     ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);

  try {
    // Check existing data (SMART MODE)
    const existing = await checkExistingData();

    // Get users
    const users = await getUserMapping();

    // Populate in phases
    await populateLanguages(existing);
    await populateJobs(users, existing);
    const insertedInterviews = await populateInterviews(users, existing);
    await populateQuestionsAndAnswers(insertedInterviews);
    await populatePerformanceReports(insertedInterviews);

    // Verify
    await verifyData();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    log.section('✨ DATABASE POPULATION COMPLETED SUCCESSFULLY');
    log.success(`Total time: ${duration} seconds`);
    log.info('\nNext steps:');
    log.info('  1. Run: npm run build');
    log.info('  2. Run: npm start');
    log.info('  3. Login and view your data!');

  } catch (error) {
    log.error(`\nPopulation failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
