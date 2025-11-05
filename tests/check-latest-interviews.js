const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ctsqmhhjacigvhmhndhh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0"
);

async function checkLatest() {
  const { data } = await supabase
    .from('interviews')
    .select('id, candidate_name, position, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('📋 Latest 5 Interviews:\n');
  data.forEach(function(i, idx) {
    console.log(idx + 1 + '. ID: ' + i.id.substring(0, 8) + '...');
    console.log('   ' + i.candidate_name + ' - ' + i.position + ' (' + i.status + ')');
    console.log('   Created: ' + new Date(i.created_at).toLocaleString() + '\n');
  });

  // Get most recent one and check its data
  if (data && data.length > 0) {
    const latest = data[0];
    console.log('\n📊 LATEST INTERVIEW DETAILS:\n');
    console.log('ID: ' + latest.id);
    console.log('Status: ' + latest.status);

    const { data: questions } = await supabase
      .from('interview_questions')
      .select('id')
      .eq('interview_id', latest.id);

    const { data: answers } = await supabase
      .from('interview_answers')
      .select('id')
      .eq('interview_id', latest.id);

    const { data: reports } = await supabase
      .from('performance_reports')
      .select('id')
      .eq('interview_id', latest.id);

    console.log('Questions: ' + (questions ? questions.length : 0));
    console.log('Answers: ' + (answers ? answers.length : 0));
    console.log('Reports: ' + (reports ? reports.length : 0));
  }
}

checkLatest().catch(console.error);
