-- ============================================================================
-- Database Migration: Add Plan Column and Structural Improvements
-- ============================================================================
-- Purpose: Add subscription plan tracking and fix structural issues
-- Date: November 3, 2025
-- Version: 1.0
-- ============================================================================

-- Add plan column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Add comment for documentation
COMMENT ON COLUMN users.plan IS 'User subscription plan: free, pro, or enterprise';

-- Add check constraint for valid plan values
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_plan_check;

ALTER TABLE users
  ADD CONSTRAINT users_plan_check
  CHECK (plan IN ('free', 'pro', 'enterprise'));

-- ============================================================================
-- Add Constraints for Data Integrity
-- ============================================================================

-- Ensure overall_score is between 0 and 100
ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_overall_score_check;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_overall_score_check
  CHECK (overall_score IS NULL OR (overall_score >= 0 AND overall_score <= 100));

-- Ensure performance report scores are in valid range (0-10)
ALTER TABLE performance_reports
  DROP CONSTRAINT IF EXISTS performance_reports_technical_score_check;

ALTER TABLE performance_reports
  ADD CONSTRAINT performance_reports_technical_score_check
  CHECK (technical_score IS NULL OR (technical_score >= 0 AND technical_score <= 10));

ALTER TABLE performance_reports
  DROP CONSTRAINT IF EXISTS performance_reports_communication_score_check;

ALTER TABLE performance_reports
  ADD CONSTRAINT performance_reports_communication_score_check
  CHECK (communication_score IS NULL OR (communication_score >= 0 AND communication_score <= 10));

ALTER TABLE performance_reports
  DROP CONSTRAINT IF EXISTS performance_reports_problem_solving_score_check;

ALTER TABLE performance_reports
  ADD CONSTRAINT performance_reports_problem_solving_score_check
  CHECK (problem_solving_score IS NULL OR (problem_solving_score >= 0 AND problem_solving_score <= 10));

-- Ensure valid interview mode
ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_mode_check;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_mode_check
  CHECK (mode IN ('Video Interview', 'Audio Interview', 'Chat Interview', 'Live Share Interview'));

-- Ensure valid interview difficulty
ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_difficulty_check;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_difficulty_check
  CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));

-- Ensure valid interview status (including scheduled)
ALTER TABLE interviews
  DROP CONSTRAINT IF EXISTS interviews_status_check;

ALTER TABLE interviews
  ADD CONSTRAINT interviews_status_check
  CHECK (status IN ('lobby', 'in_progress', 'completed', 'cancelled', 'scheduled'));

-- Ensure valid recommendation
ALTER TABLE performance_reports
  DROP CONSTRAINT IF EXISTS performance_reports_recommendation_check;

ALTER TABLE performance_reports
  ADD CONSTRAINT performance_reports_recommendation_check
  CHECK (recommendation IN ('Recommended for Hire', 'Needs Improvement', 'Not a Fit'));

-- ============================================================================
-- Add Indexes for Performance
-- ============================================================================

-- Index on interviews.user_id for faster user lookups
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);

-- Index on interviews.status for filtering
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);

-- Index on interviews.created_at for ordering
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at DESC);

-- Index on interview_questions.interview_id for faster joins
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);

-- Index on interview_questions.question_order for ordering
CREATE INDEX IF NOT EXISTS idx_interview_questions_order ON interview_questions(interview_id, question_order);

-- Index on interview_answers.question_id for faster joins
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id ON interview_answers(question_id);

-- Index on interview_answers.interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview_id ON interview_answers(interview_id);

-- Index on performance_reports.interview_id for faster joins
CREATE INDEX IF NOT EXISTS idx_performance_reports_interview_id ON performance_reports(interview_id);

-- Index on comments.interview_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_comments_interview_id ON comments(interview_id);

-- Index on comments.user_id for authorization checks
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Index on audit_logs.user_id for user activity tracking
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Index on audit_logs.action for filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Index on audit_logs.created_at for ordering
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Index on jobs.is_active for filtering active jobs
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);

-- Index on languages.is_active for filtering active languages
CREATE INDEX IF NOT EXISTS idx_languages_is_active ON languages(is_active);

-- Index on languages.code for unique lookups
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);

-- ============================================================================
-- Add Trigger for Updated_At Timestamp
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_performance_reports_updated_at ON performance_reports;
CREATE TRIGGER update_performance_reports_updated_at
  BEFORE UPDATE ON performance_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Update Existing Users to Have Default Plan
-- ============================================================================

-- Set all existing users to 'free' plan if NULL
UPDATE users SET plan = 'free' WHERE plan IS NULL;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Verify plan column exists and has correct constraint
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'plan';

-- Verify all users have a plan
SELECT
  COUNT(*) as total_users,
  COUNT(plan) as users_with_plan,
  plan,
  COUNT(*) as count_per_plan
FROM users
GROUP BY plan;

-- Verify constraints are in place
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'interviews'::regclass
  AND conname LIKE '%_check';

-- Verify indexes are created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('interviews', 'interview_questions', 'interview_answers', 'users', 'comments', 'audit_logs')
ORDER BY tablename, indexname;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
This migration adds:
1. ✅ Plan column to users table with check constraint (free, pro, enterprise)
2. ✅ Data validation constraints for scores, modes, status, etc.
3. ✅ Performance indexes on frequently queried columns
4. ✅ Automatic updated_at timestamp triggers
5. ✅ Sets all existing users to 'free' plan

After running this migration:
- All users will have a plan column
- Data integrity is enforced at database level
- Query performance will be improved with indexes
- Timestamps will update automatically

To run this migration:
1. Copy this entire file
2. Go to Supabase Dashboard → SQL Editor
3. Paste and click "Run"
4. Check verification queries at the bottom
*/
