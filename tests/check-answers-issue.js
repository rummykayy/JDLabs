const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ctsqmhhjacigvhmhndhh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0"
);

async function checkAnswersIssue() {
  console.log('🔍 Checking answers storage issue...\n');

  // Get the latest completed interview
  const { data: interviews } = await supabase
    .from('interviews')
    .select('id, candidate_name, position, status')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1);

  if (interviews && interviews.length > 0) {
    const interview = interviews[0];
    console.log(`📋 Analyzing interview: ${interview.id}`);
    console.log(`   Candidate: ${interview.candidate_name}`);
    console.log(`   Position: ${interview.position}\n`);

    // Check questions
    const { data: questions } = await supabase
      .from('interview_questions')
      .select('*')
      .eq('interview_id', interview.id);

    console.log(`📝 Questions: ${questions ? questions.length : 0}`);

    // Check answers
    const { data: answers, error: answerError } = await supabase
      .from('interview_answers')
      .select('*')
      .eq('interview_id', interview.id);

    console.log(`📝 Answers: ${answers ? answers.length : 0}`);
    if (answerError) {
      console.log(`   ❌ Error: ${answerError.message}`);
    }

    // Check if there's a constraint issue
    if (questions && questions.length > 0) {
      const q = questions[0];
      console.log(`\n🔧 Attempting to insert test answer...`);
      const { data, error } = await supabase
        .from('interview_answers')
        .insert([{
          interview_id: interview.id,
          question_id: q.id,
          answer_text: 'Test answer',
          duration_seconds: 30,
          feedback: 'Test feedback'
        }])
        .select();

      if (error) {
        console.log(`   ❌ Insert failed: ${error.message}`);
        console.log(`   Error code: ${error.code}`);
        console.log(`   Full error:`, JSON.stringify(error, null, 2));
      } else {
        console.log(`   ✅ Insert succeeded!`);
        console.log(`   Data:`, JSON.stringify(data, null, 2));
      }
    }
  }
}

checkAnswersIssue().catch(console.error);
