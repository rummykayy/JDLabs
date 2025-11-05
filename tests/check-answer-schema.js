const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://ctsqmhhjacigvhmhndhh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3FtaGhqYWNpZ3ZobWhuZGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMTcyMTcsImV4cCI6MjA3MzY5MzIxN30.hNhSQ1qoMBOKtKz5IiwhLo8HmgSpkRZzlegCxobhTa0"
);

async function checkSchema() {
  console.log('📋 Checking interview_answers table schema...\n');

  // Try to get the schema information
  const { data, error } = await supabase
    .from('interview_answers')
    .select('*')
    .limit(1);

  if (error) {
    console.log(`Error: ${error.message}`);
    return;
  }

  if (data && data.length > 0) {
    console.log('Column names in interview_answers:');
    console.log(Object.keys(data[0]));
  } else {
    console.log('No records found, attempting insert with minimal fields...');
    const { data: interviews } = await supabase
      .from('interviews')
      .select('id')
      .limit(1);

    if (interviews && interviews.length > 0) {
      const { data: questions } = await supabase
        .from('interview_questions')
        .select('id')
        .eq('interview_id', interviews[0].id)
        .limit(1);

      if (questions && questions.length > 0) {
        // Try with minimal fields
        const { data: result, error: insertError } = await supabase
          .from('interview_answers')
          .insert([{
            interview_id: interviews[0].id,
            question_id: questions[0].id,
            answer_text: 'Test'
          }])
          .select();

        if (insertError) {
          console.log(`\nMinimal insert failed: ${insertError.message}`);
        } else if (result && result.length > 0) {
          console.log('\nMinimal insert succeeded! Columns:');
          console.log(Object.keys(result[0]));
        }
      }
    }
  }
}

checkSchema().catch(console.error);
