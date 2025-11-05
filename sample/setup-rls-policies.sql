-- ============================================
-- COMPLETE ROW LEVEL SECURITY (RLS) SETUP
-- JD Labs Interview Platform
-- ============================================
-- Run this script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_shares ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (userid = auth.uid());

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (userid = auth.uid());

-- Allow system to insert user profiles (for ensureUserProfile function)
CREATE POLICY "System can insert user profiles"
ON users FOR INSERT
TO authenticated
WITH CHECK (userid = auth.uid());

-- ============================================
-- 3. JOBS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view active jobs"
ON jobs FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Users can insert own jobs"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid()::text);

CREATE POLICY "Users can update own jobs"
ON jobs FOR UPDATE
TO authenticated
USING (created_by = auth.uid()::text);

-- ============================================
-- 4. LANGUAGES TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view active languages"
ON languages FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================
-- 5. INTERVIEWS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own interviews"
ON interviews FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users WHERE userid = auth.uid()
  )
);

CREATE POLICY "Users can insert own interviews"
ON interviews FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT id FROM users WHERE userid = auth.uid()
  )
);

CREATE POLICY "Users can update own interviews"
ON interviews FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT id FROM users WHERE userid = auth.uid()
  )
);

-- ============================================
-- 6. INTERVIEW QUESTIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can access own interview questions"
ON interview_questions FOR ALL
TO authenticated
USING (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

-- ============================================
-- 7. INTERVIEW ANSWERS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can access own interview answers"
ON interview_answers FOR ALL
TO authenticated
USING (
  question_id IN (
    SELECT q.id FROM interview_questions q
    JOIN interviews i ON q.interview_id = i.id
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

-- ============================================
-- 8. PERFORMANCE REPORTS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own interview reports"
ON performance_reports FOR SELECT
TO authenticated
USING (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

CREATE POLICY "Users can create own interview reports"
ON performance_reports FOR INSERT
TO authenticated
WITH CHECK (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

CREATE POLICY "Users can update own interview reports"
ON performance_reports FOR UPDATE
TO authenticated
USING (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

-- ============================================
-- 9. COMMENTS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view comments on own interviews"
ON comments FOR SELECT
TO authenticated
USING (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

CREATE POLICY "Users can add comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own comments"
ON comments FOR UPDATE
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own comments"
ON comments FOR DELETE
TO authenticated
USING (user_id = auth.uid()::text);

-- ============================================
-- 10. AUDIT LOGS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 11. SCREEN SHARES TABLE POLICIES
-- ============================================

CREATE POLICY "Users can access own screen shares"
ON screen_shares FOR ALL
TO authenticated
USING (
  interview_id IN (
    SELECT i.id FROM interviews i
    JOIN users u ON i.user_id = u.id
    WHERE u.userid = auth.uid()
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify RLS is enabled:

-- Check if RLS is enabled on all tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should show rowsecurity = true for all tables

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should show all policies created above
