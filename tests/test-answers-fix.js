const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ctsqmhhjacigvhmhndhh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0"
);

async function testAnswersFix() {
  console.log('✅ TESTING ANSWERS FIX\n');

  // Get all interviews
  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, candidate_name, position, status')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('Recent interviews:');
  interviews.forEach((i, idx) => {
    console.log(`${idx + 1}. ${i.candidate_name} - ${i.position} (${i.status})`);
  });

  if (interviews && interviews.length > 0) {
    const interview = interviews[0];
    console.log(`\n📋 Checking interview: ${interview.id}\n`);

    // Check questions
    const { data: questions } = await supabase
      .from('interview_questions')
      .select('id, question_text, question_order')
      .eq('interview_id', interview.id)
      .order('question_order');

    console.log(`✅ Questions: ${questions ? questions.length : 0}`);

    // Check answers
    const { data: answers } = await supabase
      .from('interview_answers')
      .select('id, answer_text, duration_seconds')
      .eq('interview_id', interview.id);

    console.log(`✅ Answers: ${answers ? answers.length : 0}`);

    // Check performance reports
    const { data: reports } = await supabase
      .from('performance_reports')
      .select('id, overall_score')
      .eq('interview_id', interview.id);

    console.log(`✅ Reports: ${reports ? reports.length : 0}`);

    // Check audit logs
    const { data: logs } = await supabase
      .from('audit_logs')
      .select('id, operation, details')
      .eq('interview_id', interview.id)
      .eq('operation', 'INTERVIEW_FINALIZE');

    console.log(`✅ INTERVIEW_FINALIZE logs: ${logs ? logs.length : 0}\n`);

    if (questions && questions.length > 0 && answers && answers.length > 0) {
      console.log('📊 DETAILED DATA:');
      questions.forEach((q, i) => {
        const answer = answers[i];
        console.log(`\n  Q${q.question_order}: ${q.question_text.substring(0, 50)}...`);
        if (answer) {
          console.log(`  A: ${answer.answer_text.substring(0, 50)}... (${answer.duration_seconds}s)`);
        }
      });
    }
  }
}

testAnswersFix().catch(console.error);
