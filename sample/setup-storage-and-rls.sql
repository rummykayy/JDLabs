-- ============================================================================
-- JD Labs - Storage Buckets and RLS Policies Setup
-- ============================================================================
-- Run this in Supabase SQL Editor after schema migration
-- https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/sql/new
-- ============================================================================

-- ============================================================================
-- PART 1: STORAGE BUCKETS SETUP
-- ============================================================================

-- Create interview-recordings bucket for video/audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'interview-recordings',
  'interview-recordings',
  false, -- Private bucket
  52428800, -- 50 MB limit
  ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg'];

-- Create screen-recordings bucket for screen share recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'screen-recordings',
  'screen-recordings',
  false, -- Private bucket
  104857600, -- 100 MB limit
  ARRAY['video/webm', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/webm', 'video/mp4'];

-- Create user-avatars bucket for profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true, -- Public bucket (avatars can be public)
  2097152, -- 2 MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- ============================================================================
-- PART 2: STORAGE RLS POLICIES
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Interview Recordings Bucket Policies
-- ============================================================================

-- Policy: Users can upload their own interview recordings
CREATE POLICY "Users can upload own interview recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own interview recordings
CREATE POLICY "Users can read own interview recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own interview recordings
CREATE POLICY "Users can update own interview recordings"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own interview recordings
CREATE POLICY "Users can delete own interview recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'interview-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- Screen Recordings Bucket Policies
-- ============================================================================

-- Policy: Users can upload their own screen recordings
CREATE POLICY "Users can upload own screen recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'screen-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can read their own screen recordings
CREATE POLICY "Users can read own screen recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'screen-recordings'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- User Avatars Bucket Policies
-- ============================================================================

-- Policy: Anyone can read avatars (public bucket)
CREATE POLICY "Anyone can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'user-avatars');

-- Policy: Authenticated users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- PART 3: TABLE RLS POLICIES
-- ============================================================================

-- Note: Some tables already have RLS enabled from schema migration
-- We'll add comprehensive policies here

-- ============================================================================
-- Users Table Policies
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT
TO authenticated
USING (userid = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
TO authenticated
USING (userid = auth.uid())
WITH CHECK (userid = auth.uid());

-- ============================================================================
-- Profiles Table Policies
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile data"
ON public.profiles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = profiles.user_id
    AND users.userid = auth.uid()
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own profile data"
ON public.profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = profiles.user_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Interviews Table Policies
-- ============================================================================

-- Users can read their own interviews
CREATE POLICY "Users can read own interviews"
ON public.interviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = interviews.user_id
    AND users.userid = auth.uid()
  )
);

-- Users can create interviews
CREATE POLICY "Users can create interviews"
ON public.interviews FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.userid = auth.uid()
  )
);

-- Users can update their own interviews
CREATE POLICY "Users can update own interviews"
ON public.interviews FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = interviews.user_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Interview Questions Table Policies
-- ============================================================================

-- Users can read questions for their interviews
CREATE POLICY "Users can read own interview questions"
ON public.interview_questions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_questions.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create questions for their interviews
CREATE POLICY "Users can create interview questions"
ON public.interview_questions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Interview Answers Table Policies
-- ============================================================================

-- Enable RLS on interview_answers
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

-- Users can read answers for their interviews
CREATE POLICY "Users can read own interview answers"
ON public.interview_answers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_answers.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create answers for their interviews
CREATE POLICY "Users can create interview answers"
ON public.interview_answers FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Messages Table Policies
-- ============================================================================

-- Users can read messages from their interviews
CREATE POLICY "Users can read own interview messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = messages.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create messages in their interviews
CREATE POLICY "Users can create interview messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Interview Assessments Table Policies
-- ============================================================================

-- Users can read assessments for their interviews
CREATE POLICY "Users can read own interview assessments"
ON public.interview_assessments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_assessments.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create assessments for their interviews
CREATE POLICY "Users can create interview assessments"
ON public.interview_assessments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Performance Reports Table Policies
-- ============================================================================

-- Enable RLS on performance_reports
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;

-- Users can read performance reports for their interviews
CREATE POLICY "Users can read own performance reports"
ON public.performance_reports FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE (users.id = performance_reports.candidate_id
           OR users.id = performance_reports.interviewer_id)
    AND users.userid = auth.uid()
  )
);

-- Users can create performance reports for interviews they conducted
CREATE POLICY "Users can create performance reports"
ON public.performance_reports FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = interviewer_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Comments Table Policies
-- ============================================================================

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Users can read comments on their interviews
CREATE POLICY "Users can read interview comments"
ON public.comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = comments.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create comments
CREATE POLICY "Users can create comments"
ON public.comments FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.userid = auth.uid()
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.comments FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = comments.user_id
    AND users.userid = auth.uid()
  )
);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = comments.user_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Public Tables (No RLS needed, but enable for jobs and languages if needed)
-- ============================================================================

-- Jobs table - public read access
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active jobs"
ON public.jobs FOR SELECT
TO public
USING (is_active = true);

CREATE POLICY "Authenticated users can create jobs"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Languages table - public read access
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active languages"
ON public.languages FOR SELECT
TO public
USING (is_active = true);

-- ============================================================================
-- Settings Table Policies
-- ============================================================================

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Users can read their own settings
CREATE POLICY "Users can read own settings"
ON public.settings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = settings.user_id
    AND users.userid = auth.uid()
  )
);

-- Users can update their own settings
CREATE POLICY "Users can update own settings"
ON public.settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = settings.user_id
    AND users.userid = auth.uid()
  )
);

-- Users can insert their own settings
CREATE POLICY "Users can insert own settings"
ON public.settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = user_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Payments and Usage Tables Policies
-- ============================================================================

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment records
CREATE POLICY "Users can read own payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = payments.user_id
    AND users.userid = auth.uid()
  )
);

-- Enable RLS on usage
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage records
CREATE POLICY "Users can read own usage"
ON public.usage FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = usage.user_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- Audit Logs Table Policies
-- ============================================================================

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (user_id::text = auth.uid()::text);

-- System can insert audit logs (service role)
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================================================
-- Screen Shares Table Policies
-- ============================================================================

-- Enable RLS on screen_shares
ALTER TABLE public.screen_shares ENABLE ROW LEVEL SECURITY;

-- Users can read screen shares for their interviews
CREATE POLICY "Users can read own screen shares"
ON public.screen_shares FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = screen_shares.interview_id
    AND users.userid = auth.uid()
  )
);

-- Users can create screen shares for their interviews
CREATE POLICY "Users can create screen shares"
ON public.screen_shares FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.interviews
    JOIN public.users ON users.id = interviews.user_id
    WHERE interviews.id = interview_id
    AND users.userid = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify setup:

-- Check storage buckets
-- SELECT * FROM storage.buckets;

-- Check storage policies
-- SELECT * FROM pg_policies WHERE schemaname = 'storage';

-- Check table policies
-- SELECT schemaname, tablename, policyname, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test language loading
-- SELECT * FROM public.languages WHERE is_active = true ORDER BY name;

-- ============================================================================
-- END OF SETUP SCRIPT
-- ============================================================================
